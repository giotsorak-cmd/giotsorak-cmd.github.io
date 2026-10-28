package gr.comfystay.krateseis;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * Κρατήσεις ComfyStay.
 * Η εφαρμογή ανοίγει τη σελίδα https://comfystay.gr/krateseis/ (GitHub Pages),
 * οπότε κάθε αλλαγή στη σελίδα φτάνει στο κινητό χωρίς νέο APK.
 * Το Android προσθέτει: αποθήκευση Excel στις Λήψεις, κλήση τηλεφώνου, επιλογή αρχείου για εισαγωγή.
 */
public class MainActivity extends Activity {
    private static final String APP_URL = "https://comfystay.gr/krateseis/";
    private static final String XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private static final int FILE_CHOOSER = 1001;

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new Bridge(), "AndroidNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                if (scheme.equals("tel") || scheme.equals("mailto") || scheme.equals("sms")) {
                    openExternal(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                }
                String host = uri.getHost() == null ? "" : uri.getHost();
                if (scheme.startsWith("http") && !host.endsWith("comfystay.gr")
                        && !host.endsWith("firebaseapp.com") && !host.endsWith("googleapis.com")) {
                    openExternal(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                }
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.loadUrl("file:///android_asset/offline.html");
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Επιλογή αρχείου"), FILE_CHOOSER);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL + "?v=" + System.currentTimeMillis());
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
            fileCallback.onReceiveValue(result);
            fileCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void openExternal(Intent intent) {
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Δεν βρέθηκε εφαρμογή για αυτή την ενέργεια", Toast.LENGTH_SHORT).show();
        }
    }

    public class Bridge {
        /** Αποθηκεύει αρχείο (base64) στις Λήψεις και προσπαθεί να το ανοίξει. Επιστρέφει "OK" ή "ERROR: ...". */
        @JavascriptInterface
        public String saveFile(String name, String base64) {
            try {
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                final Uri uri;
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                    v.put(MediaStore.MediaColumns.MIME_TYPE, XLSX_MIME);
                    v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (uri == null) return "ERROR: δεν δημιουργήθηκε το αρχείο";
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                        if (os == null) return "ERROR: δεν γράφτηκε το αρχείο";
                        os.write(bytes);
                    }
                } else {
                    File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    if (dir == null) return "ERROR: δεν υπάρχει χώρος αποθήκευσης";
                    File f = new File(dir, name);
                    try (FileOutputStream os = new FileOutputStream(f)) {
                        os.write(bytes);
                    }
                    uri = null;
                }
                runOnUiThread(() -> {
                    Toast.makeText(MainActivity.this, "Αποθηκεύτηκε: " + name, Toast.LENGTH_LONG).show();
                    if (uri != null) {
                        Intent open = new Intent(Intent.ACTION_VIEW);
                        open.setDataAndType(uri, XLSX_MIME);
                        open.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        try {
                            startActivity(Intent.createChooser(open, "Άνοιγμα με"));
                        } catch (Exception ignored) {
                        }
                    }
                });
                return "OK";
            } catch (Exception e) {
                return "ERROR: " + e.getMessage();
            }
        }

        @JavascriptInterface
        public void reload() {
            runOnUiThread(() -> webView.loadUrl(APP_URL + "?v=" + System.currentTimeMillis()));
        }
    }
}
