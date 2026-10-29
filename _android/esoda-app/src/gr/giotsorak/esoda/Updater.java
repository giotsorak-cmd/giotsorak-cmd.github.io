package gr.giotsorak.esoda;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInstaller;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** Ελέγχει στο comfystay.gr/esoda/version.json για νέα έκδοση και την εγκαθιστά πάνω στην τωρινή (τα δεδομένα μένουν). */
public final class Updater {
    private Updater() {}

    public static final String BASE = "https://comfystay.gr/esoda/";
    static boolean busy = false;
    static String pendingApk;   // περιμένει άδεια «άγνωστες εφαρμογές»
    static String pendingVer;

    static int myVersion(Context c) {
        try {
            return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionCode;
        } catch (Exception e) {
            return 0;
        }
    }

    static String myVersionName(Context c) {
        try {
            return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "?";
        }
    }

    static HttpURLConnection open(String url) throws Exception {
        HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
        h.setConnectTimeout(15000);
        h.setReadTimeout(30000);
        h.setInstanceFollowRedirects(true);
        h.setUseCaches(false);
        return h;
    }

    /** manual=true: δείχνει μήνυμα και όταν δεν υπάρχει νέα έκδοση. */
    public static void check(final Activity a, final boolean manual) {
        if (busy) return;
        final SharedPreferences prefs = a.getSharedPreferences("prefs", Context.MODE_PRIVATE);
        if (!manual && System.currentTimeMillis() - prefs.getLong("last_update_check", 0) < 6 * 3600 * 1000L) return;
        busy = true;
        new Thread(new Runnable() {
            @Override
            public void run() {
                String err = null;
                JSONObject info = null;
                try {
                    HttpURLConnection h = open(BASE + "version.json?t=" + System.currentTimeMillis());
                    InputStream is = h.getInputStream();
                    ByteArrayOutputStream bo = new ByteArrayOutputStream();
                    byte[] buf = new byte[4096];
                    int n;
                    while ((n = is.read(buf)) > 0) bo.write(buf, 0, n);
                    is.close();
                    info = new JSONObject(new String(bo.toByteArray(), "UTF-8"));
                    prefs.edit().putLong("last_update_check", System.currentTimeMillis()).apply();
                } catch (Exception e) {
                    err = e.getMessage();
                }
                final JSONObject fi = info;
                final String fe = err;
                a.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        busy = false;
                        if (a.isFinishing()) return;
                        if (fi == null) {
                            if (manual) toast(a, "Δεν ήταν δυνατός ο έλεγχος (internet;) " + (fe == null ? "" : fe));
                            return;
                        }
                        int vc = fi.optInt("versionCode", 0);
                        if (vc <= myVersion(a)) {
                            if (manual) toast(a, "Έχεις την τελευταία έκδοση (" + myVersionName(a) + ")");
                            return;
                        }
                        final String apk = fi.optString("apk", "EsodaExoda.apk");
                        final String ver = fi.optString("versionName", String.valueOf(vc));
                        new AlertDialog.Builder(a)
                                .setTitle("Νέα έκδοση " + ver)
                                .setMessage(fi.optString("notes", "") + "\n\nΤα δεδομένα σου μένουν ως έχουν.")
                                .setPositiveButton("Ενημέρωση", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface d, int w) {
                                        startInstall(a, apk.startsWith("http") ? apk : BASE + apk, ver);
                                    }
                                })
                                .setNegativeButton("Αργότερα", null)
                                .show();
                    }
                });
            }
        }).start();
    }

    static void startInstall(final Activity a, final String url, final String ver) {
        if (Build.VERSION.SDK_INT >= 26 && !a.getPackageManager().canRequestPackageInstalls()) {
            pendingApk = url;
            pendingVer = ver;
            new AlertDialog.Builder(a)
                    .setTitle("Χρειάζεται μία άδεια")
                    .setMessage("Για να ενημερώνεται μόνη της, η εφαρμογή χρειάζεται την άδεια «Εγκατάσταση άγνωστων εφαρμογών». "
                            + "Ενεργοποίησέ την στην επόμενη οθόνη και πάτα Πίσω.")
                    .setPositiveButton("Ρυθμίσεις", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface d, int w) {
                            try {
                                a.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                                        Uri.parse("package:" + a.getPackageName())));
                            } catch (Exception e) {
                                toast(a, "Άνοιξε Ρυθμίσεις → Εφαρμογές → Έσοδα Έξοδα → Εγκατάσταση άγνωστων εφαρμογών");
                            }
                        }
                    })
                    .setNegativeButton("Άκυρο", null)
                    .show();
            return;
        }
        download(a, url, ver);
    }

    /** Καλείται στο onResume: αν ο χρήστης μόλις έδωσε την άδεια, συνεχίζει. */
    public static void resume(Activity a) {
        if (pendingApk == null) return;
        if (Build.VERSION.SDK_INT >= 26 && !a.getPackageManager().canRequestPackageInstalls()) return;
        String u = pendingApk, v = pendingVer;
        pendingApk = null;
        download(a, u, v);
    }

    static void download(final Activity a, final String url, final String ver) {
        final AlertDialog prog = new AlertDialog.Builder(a)
                .setTitle("Λήψη έκδοσης " + ver)
                .setMessage("Ξεκινάει…")
                .setCancelable(false)
                .show();
        new Thread(new Runnable() {
            @Override
            public void run() {
                String err = null;
                try {
                    HttpURLConnection h = open(url + (url.contains("?") ? "&" : "?") + "t=" + System.currentTimeMillis());
                    int total = h.getContentLength();
                    InputStream is = h.getInputStream();
                    PackageInstaller pi = a.getPackageManager().getPackageInstaller();
                    PackageInstaller.SessionParams sp = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
                    sp.setAppPackageName(a.getPackageName());
                    int sid = pi.createSession(sp);
                    PackageInstaller.Session s = pi.openSession(sid);
                    OutputStream out = s.openWrite("update.apk", 0, total > 0 ? total : -1);
                    byte[] buf = new byte[32768];
                    int n;
                    long done = 0, lastUi = 0;
                    while ((n = is.read(buf)) > 0) {
                        out.write(buf, 0, n);
                        done += n;
                        if (total > 0 && System.currentTimeMillis() - lastUi > 200) {
                            lastUi = System.currentTimeMillis();
                            final int pct = (int) (done * 100 / total);
                            a.runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    prog.setMessage("Λήψη… " + pct + "%");
                                }
                            });
                        }
                    }
                    is.close();
                    s.fsync(out);
                    out.close();
                    Intent i = new Intent(a, InstallReceiver.class);
                    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                    if (Build.VERSION.SDK_INT >= 31) flags |= PendingIntent.FLAG_MUTABLE;
                    PendingIntent pend = PendingIntent.getBroadcast(a, sid, i, flags);
                    s.commit(pend.getIntentSender());
                    s.close();
                } catch (Exception e) {
                    err = e.getMessage() == null ? e.toString() : e.getMessage();
                }
                final String fe = err;
                a.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            prog.dismiss();
                        } catch (Exception ignored) {
                        }
                        if (fe != null) toast(a, "Η ενημέρωση απέτυχε: " + fe);
                    }
                });
            }
        }).start();
    }

    static void toast(Context c, String s) {
        Toast.makeText(c, s, Toast.LENGTH_LONG).show();
    }

    /** Αποτέλεσμα της εγκατάστασης· ζητάει επιβεβαίωση από τον χρήστη όταν χρειάζεται. */
    public static class InstallReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context c, Intent intent) {
            int status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, -999);
            if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
                Intent confirm = intent.getParcelableExtra(Intent.EXTRA_INTENT);
                if (confirm != null) {
                    confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    try {
                        c.startActivity(confirm);
                    } catch (Exception e) {
                        toast(c, "Δεν άνοιξε η οθόνη εγκατάστασης: " + e.getMessage());
                    }
                }
            } else if (status != PackageInstaller.STATUS_SUCCESS) {
                String msg = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
                if (status != PackageInstaller.STATUS_FAILURE_ABORTED)
                    toast(c, "Η ενημέρωση δεν ολοκληρώθηκε" + (msg == null ? "" : ": " + msg));
            }
        }
    }
}
