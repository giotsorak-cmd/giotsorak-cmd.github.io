package gr.giotsorak.esoda;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.RippleDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.text.Editable;
import android.text.InputType;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.text.method.DigitsKeyListener;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends Activity {

    // χρώματα
    static final int PRIMARY = 0xFF1F4E5F, PRIMARY_DARK = 0xFF173C49, BG = 0xFFF2F4F6, CARD = 0xFFFFFFFF,
            TEXT = 0xFF1B2430, SUB = 0xFF6B7785, INC = 0xFF2E7D32, EXP = 0xFFC62828, ACCENT = 0xFFF2A541,
            DIV = 0xFFE6EAEE, SOFT = 0xFFDDEBF0;

    static final int REQ_XLSX = 11, REQ_BACKUP = 12, REQ_RESTORE = 13;
    static final String XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    Db db;
    SharedPreferences prefs;
    int year, month, tab = 0;
    Long filterCat = null;
    String search = "";
    boolean showHidden = false;
    boolean descYear = false, descIncome = false;
    String descSearch = "";
    LinearLayout descListBox;
    int pendingYear;

    FrameLayout content;
    TextView period, fab;
    LinearLayout[] tabViews = new LinearLayout[5];
    TextView[] tabIcons = new TextView[5], tabLabels = new TextView[5];
    LinearLayout txListBox;
    List<Db.Tx> monthTx = new ArrayList<Db.Tx>();
    Map<Long, Db.Category> catCache = new HashMap<Long, Db.Category>();

    // ================================================================= lifecycle

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        db = Db.get(this);
        prefs = getSharedPreferences("prefs", MODE_PRIVATE);
        Calendar now = Calendar.getInstance();
        year = now.get(Calendar.YEAR);
        month = now.get(Calendar.MONTH) + 1;
        if (state != null) {
            year = state.getInt("y", year);
            month = state.getInt("m", month);
            tab = state.getInt("t", 0);
        }
        getWindow().setStatusBarColor(PRIMARY_DARK);
        buildShell();
        render();
        prefs.edit().putBoolean("first_run_done", true).apply();
        Updater.check(this, false);
    }

    @Override
    protected void onResume() {
        super.onResume();
        Updater.resume(this);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        out.putInt("y", year);
        out.putInt("m", month);
        out.putInt("t", tab);
    }

    int ym() {
        return Fmt.ym(year, month);
    }

    // ================================================================= UI helpers

    int dp(float v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }

    TextView tv(String s, float sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    LinearLayout row() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.HORIZONTAL);
        l.setGravity(Gravity.CENTER_VERTICAL);
        return l;
    }

    LinearLayout col() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        return l;
    }

    GradientDrawable round(int color, float radiusDp) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(dp(radiusDp));
        return g;
    }

    GradientDrawable outline(int fill, int stroke, float radiusDp) {
        GradientDrawable g = round(fill, radiusDp);
        g.setStroke(dp(1), stroke);
        return g;
    }

    Drawable ripple(Drawable content) {
        return new RippleDrawable(ColorStateList.valueOf(0x22000000), content,
                content == null ? new ColorDrawable(Color.WHITE) : null);
    }

    LinearLayout.LayoutParams lp(int w, int h) {
        return new LinearLayout.LayoutParams(w, h);
    }

    LinearLayout.LayoutParams lpw(float weight) {
        return new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, weight);
    }

    static final int MATCH = ViewGroup.LayoutParams.MATCH_PARENT, WRAP = ViewGroup.LayoutParams.WRAP_CONTENT;

    LinearLayout card() {
        LinearLayout c = col();
        c.setBackground(round(CARD, 14));
        c.setElevation(dp(1.5f));
        c.setPadding(dp(14), dp(12), dp(14), dp(12));
        return c;
    }

    void addCard(LinearLayout parent, View card) {
        LinearLayout.LayoutParams p = lp(MATCH, WRAP);
        p.setMargins(dp(2), 0, dp(2), dp(12));
        parent.addView(card, p);
    }

    View divider() {
        View v = new View(this);
        v.setBackgroundColor(DIV);
        return v;
    }

    void addDivider(LinearLayout parent, int insetDp) {
        LinearLayout.LayoutParams p = lp(MATCH, Math.max(1, dp(0.8f)));
        p.setMargins(dp(insetDp), 0, 0, 0);
        parent.addView(divider(), p);
    }

    TextView button(String text, boolean filled) {
        TextView b = tv(text, 14, filled ? Color.WHITE : PRIMARY, true);
        b.setGravity(Gravity.CENTER);
        b.setPadding(dp(14), dp(10), dp(14), dp(10));
        b.setBackground(ripple(filled ? round(PRIMARY, 22) : outline(CARD, PRIMARY, 22)));
        b.setClickable(true);
        return b;
    }

    TextView chip(String text, boolean selected, int color) {
        TextView c = tv(text, 13, selected ? Color.WHITE : TEXT, selected);
        c.setPadding(dp(12), dp(7), dp(12), dp(7));
        c.setBackground(ripple(selected ? round(color, 18) : outline(CARD, 0xFFCBD3DA, 18)));
        c.setClickable(true);
        return c;
    }

    View dot(int color, int sizeDp) {
        View v = new View(this);
        GradientDrawable g = new GradientDrawable();
        g.setShape(GradientDrawable.OVAL);
        g.setColor(color);
        v.setBackground(g);
        LinearLayout.LayoutParams p = lp(dp(sizeDp), dp(sizeDp));
        p.setMargins(0, 0, dp(10), 0);
        v.setLayoutParams(p);
        return v;
    }

    LinearLayout stat(String label, String value, int color) {
        LinearLayout c = col();
        c.setGravity(Gravity.CENTER_HORIZONTAL);
        TextView l = tv(label, 12, SUB, false);
        l.setGravity(Gravity.CENTER);
        TextView v = tv(value, 16, color, true);
        v.setGravity(Gravity.CENTER);
        v.setSingleLine(true);
        c.addView(l);
        c.addView(v);
        return c;
    }

    static int amountColor(double v) {
        return v > 0.004 ? INC : v < -0.004 ? EXP : SUB;
    }

    TextView sectionTitle(String s) {
        TextView t = tv(s, 15, TEXT, true);
        t.setPadding(0, 0, 0, dp(8));
        return t;
    }

    void toast(String s) {
        Toast.makeText(this, s, Toast.LENGTH_SHORT).show();
    }

    static String norm(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return n.toLowerCase(Locale.ROOT).replace('ς', 'σ');
    }

    EditText field(String hint) {
        EditText e = new EditText(this);
        e.setHint(hint);
        e.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        e.setSingleLine(true);
        return e;
    }

    EditText moneyField(String hint, boolean signed) {
        EditText e = field(hint);
        e.setKeyListener(DigitsKeyListener.getInstance(signed ? "0123456789.,-" : "0123456789.,"));
        e.setRawInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL
                | (signed ? InputType.TYPE_NUMBER_FLAG_SIGNED : 0));
        return e;
    }

    LinearLayout dialogBox() {
        LinearLayout v = col();
        v.setPadding(dp(22), dp(10), dp(22), dp(4));
        return v;
    }

    ScrollView scroll(View inner) {
        ScrollView sv = new ScrollView(this);
        sv.addView(inner);
        return sv;
    }

    TextView label(String s) {
        TextView t = tv(s, 13, SUB, true);
        t.setPadding(0, dp(12), 0, dp(6));
        return t;
    }

    // ================================================================= shell

    void buildShell() {
        LinearLayout root = col();
        root.setBackgroundColor(BG);

        LinearLayout header = col();
        header.setBackgroundColor(PRIMARY);
        header.setPadding(dp(16), dp(10), dp(6), dp(6));
        LinearLayout r1 = row();
        TextView title = tv("Έσοδα & Έξοδα", 20, Color.WHITE, true);
        r1.addView(title, lpw(1));
        final TextView menu = tv("⋮", 26, Color.WHITE, true);
        menu.setPadding(dp(14), dp(2), dp(14), dp(2));
        menu.setBackground(ripple(null));
        menu.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showMenu(menu);
            }
        });
        r1.addView(menu);
        header.addView(r1);

        LinearLayout r2 = row();
        r2.setPadding(0, dp(4), dp(10), 0);
        TextView prev = tv("‹", 32, Color.WHITE, true);
        prev.setPadding(dp(14), 0, dp(14), dp(4));
        prev.setBackground(ripple(null));
        prev.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                shift(-1);
            }
        });
        TextView next = tv("›", 32, Color.WHITE, true);
        next.setPadding(dp(14), 0, dp(14), dp(4));
        next.setBackground(ripple(null));
        next.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                shift(1);
            }
        });
        period = tv("", 18, Color.WHITE, true);
        period.setGravity(Gravity.CENTER);
        period.setPadding(0, dp(6), 0, dp(6));
        period.setBackground(ripple(null));
        period.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                pickPeriod();
            }
        });
        r2.addView(prev);
        r2.addView(period, lpw(1));
        r2.addView(next);
        header.addView(r2);
        root.addView(header, lp(MATCH, WRAP));

        FrameLayout body = new FrameLayout(this);
        content = new FrameLayout(this);
        body.addView(content, new FrameLayout.LayoutParams(MATCH, MATCH));
        fab = tv("+", 30, Color.WHITE, false);
        fab.setGravity(Gravity.CENTER);
        fab.setIncludeFontPadding(false);
        GradientDrawable fg = new GradientDrawable();
        fg.setShape(GradientDrawable.OVAL);
        fg.setColor(PRIMARY);
        fab.setBackground(ripple(fg));
        fab.setElevation(dp(6));
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showTxDialog(null);
            }
        });
        FrameLayout.LayoutParams fp = new FrameLayout.LayoutParams(dp(60), dp(60), Gravity.BOTTOM | Gravity.END);
        fp.setMargins(0, 0, dp(18), dp(18));
        body.addView(fab, fp);
        root.addView(body, new LinearLayout.LayoutParams(MATCH, 0, 1));

        LinearLayout nav = row();
        nav.setBackgroundColor(CARD);
        nav.setElevation(dp(8));
        nav.setPadding(0, dp(6), 0, dp(6));
        String[] icons = {"📋", "📊", "🛒", "📅", "🏦"};
        String[] labels = {"Κινήσεις", "Σύνοψη", "Ανά έξοδο", "Έτος", "Λογ/σμοί"};
        for (int i = 0; i < 5; i++) {
            final int idx = i;
            LinearLayout t = col();
            t.setGravity(Gravity.CENTER_HORIZONTAL);
            t.setBackground(ripple(null));
            t.setPadding(0, dp(2), 0, dp(2));
            TextView ic = tv(icons[i], 18, TEXT, false);
            ic.setGravity(Gravity.CENTER);
            ic.setPadding(dp(12), dp(3), dp(12), dp(3));
            TextView lb = tv(labels[i], 11, SUB, false);
            lb.setGravity(Gravity.CENTER);
            lb.setSingleLine(true);
            t.addView(ic, lp(WRAP, WRAP));
            t.addView(lb, lp(WRAP, WRAP));
            t.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (tab == idx && idx == 0 && filterCat != null) filterCat = null;
                    tab = idx;
                    render();
                }
            });
            tabViews[i] = t;
            tabIcons[i] = ic;
            tabLabels[i] = lb;
            nav.addView(t, lpw(1));
        }
        root.addView(nav, lp(MATCH, WRAP));
        setContentView(root);
    }

    void shift(int d) {
        if (isYearView()) {
            year += d;
        } else {
            month += d;
            if (month < 1) {
                month = 12;
                year--;
            } else if (month > 12) {
                month = 1;
                year++;
            }
        }
        render();
    }

    void pickPeriod() {
        String[] items = new String[12];
        for (int i = 0; i < 12; i++) items[i] = Fmt.MONTHS[i] + " " + year;
        new AlertDialog.Builder(this)
                .setTitle("Επιλογή μήνα")
                .setItems(items, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int which) {
                        month = which + 1;
                        if (tab == 3) tab = 0;
                        if (tab == 2) descYear = false;
                        render();
                    }
                })
                .setNeutralButton("Σήμερα", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int which) {
                        Calendar c = Calendar.getInstance();
                        year = c.get(Calendar.YEAR);
                        month = c.get(Calendar.MONTH) + 1;
                        render();
                    }
                })
                .setNegativeButton("Άκυρο", null)
                .show();
    }

    boolean isYearView() {
        return tab == 3 || (tab == 2 && descYear);
    }

    void render() {
        period.setText(isYearView() ? "Έτος " + year : Fmt.monthTitle(year, month));
        catCache = db.categoryMap();
        content.removeAllViews();
        View v;
        switch (tab) {
            case 1: v = buildSummaryTab(); break;
            case 2: v = buildDescTab(); break;
            case 3: v = buildYearTab(); break;
            case 4: v = buildAccountsTab(); break;
            default: v = buildTxTab();
        }
        content.addView(v, new FrameLayout.LayoutParams(MATCH, MATCH));
        fab.setVisibility(tab == 0 || tab == 1 ? View.VISIBLE : View.GONE);
        for (int i = 0; i < 5; i++) {
            boolean sel = i == tab;
            tabLabels[i].setTextColor(sel ? PRIMARY : SUB);
            tabLabels[i].setTypeface(sel ? Typeface.DEFAULT_BOLD : Typeface.DEFAULT);
            tabIcons[i].setBackground(sel ? round(SOFT, 14) : null);
        }
    }

    LinearLayout pageBox(ScrollView sv) {
        sv.setFillViewport(true);
        LinearLayout box = col();
        box.setPadding(dp(12), dp(12), dp(12), dp(96));
        sv.addView(box, new FrameLayout.LayoutParams(MATCH, WRAP));
        return box;
    }

    // ================================================================= tab 0: κινήσεις

    View buildTxTab() {
        ScrollView sv = new ScrollView(this);
        LinearLayout box = pageBox(sv);
        monthTx = db.txForMonth(ym());
        double inc = 0, exp = 0;
        for (Db.Tx t : monthTx) {
            if (t.amount > 0) inc += t.amount;
            else exp += t.amount;
        }

        backupBanner(box);

        LinearLayout c = card();
        LinearLayout r = row();
        r.addView(stat("Έσοδα", Fmt.money(inc), INC), lpw(1));
        r.addView(stat("Έξοδα", Fmt.money(-exp), EXP), lpw(1));
        r.addView(stat("Αποτέλεσμα", Fmt.signed(inc + exp), amountColor(inc + exp)), lpw(1));
        c.addView(r);
        addCard(box, c);

        EditText s = field("🔍  Αναζήτηση στον μήνα");
        s.setText(search);
        s.setBackground(outline(CARD, 0xFFD5DCE2, 12));
        s.setPadding(dp(14), dp(10), dp(14), dp(10));
        s.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence a, int b, int cc, int d) {
            }

            @Override
            public void onTextChanged(CharSequence a, int b, int cc, int d) {
            }

            @Override
            public void afterTextChanged(Editable e) {
                search = e.toString();
                fillTxList();
            }
        });
        LinearLayout.LayoutParams sp = lp(MATCH, WRAP);
        sp.setMargins(dp(2), 0, dp(2), dp(10));
        box.addView(s, sp);

        HorizontalScrollView hs = new HorizontalScrollView(this);
        hs.setHorizontalScrollBarEnabled(false);
        LinearLayout chips = row();
        hs.addView(chips);
        TextView all = chip("Όλες", filterCat == null, PRIMARY);
        all.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                filterCat = null;
                render();
            }
        });
        LinearLayout.LayoutParams cp = lp(WRAP, WRAP);
        cp.setMargins(0, 0, dp(8), 0);
        chips.addView(all, cp);
        for (final Db.Category k : catCache.values()) {
            TextView ch = chip(k.name, filterCat != null && filterCat == k.id, k.color);
            ch.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    filterCat = (filterCat != null && filterCat == k.id) ? null : k.id;
                    render();
                }
            });
            LinearLayout.LayoutParams p = lp(WRAP, WRAP);
            p.setMargins(0, 0, dp(8), 0);
            chips.addView(ch, p);
        }
        LinearLayout.LayoutParams hp = lp(MATCH, WRAP);
        hp.setMargins(dp(2), 0, dp(2), dp(12));
        box.addView(hs, hp);

        txListBox = col();
        box.addView(txListBox, lp(MATCH, WRAP));
        fillTxList();
        return sv;
    }

    void fillTxList() {
        if (txListBox == null) return;
        txListBox.removeAllViews();
        String q = norm(search.trim());
        List<Db.Tx> list = new ArrayList<Db.Tx>();
        double sum = 0;
        for (Db.Tx t : monthTx) {
            if (filterCat != null && t.catId != filterCat) continue;
            if (!q.isEmpty()) {
                Db.Category k = catCache.get(t.catId);
                String hay = norm(t.descr + " " + t.note + " " + (k == null ? "" : k.name) + " " + Fmt.num(Math.abs(t.amount)));
                if (!hay.contains(q)) continue;
            }
            list.add(t);
            sum += t.amount;
        }
        if (filterCat != null || !q.isEmpty()) {
            Db.Category k = filterCat == null ? null : catCache.get(filterCat);
            LinearLayout r = row();
            r.setPadding(dp(6), 0, dp(6), dp(10));
            r.addView(tv(list.size() + " κινήσεις" + (k != null ? " · " + k.name : ""), 13, SUB, false), lpw(1));
            r.addView(tv("Σύνολο " + Fmt.signed(sum), 14, amountColor(sum), true));
            txListBox.addView(r);
        }
        if (list.isEmpty()) {
            TextView e = tv(monthTx.isEmpty() ? "Δεν υπάρχουν κινήσεις για τον " + Fmt.MONTHS[month - 1] + ".\nΠάτα + για να προσθέσεις."
                    : "Δεν βρέθηκαν κινήσεις.", 15, SUB, false);
            e.setGravity(Gravity.CENTER);
            e.setPadding(dp(16), dp(40), dp(16), dp(40));
            txListBox.addView(e, lp(MATCH, WRAP));
            return;
        }
        String curDate = null;
        LinearLayout group = null;
        double dayTotal = 0;
        TextView dayTotalView = null;
        for (Db.Tx t : list) {
            if (!t.date.equals(curDate)) {
                if (dayTotalView != null) dayTotalView.setText(Fmt.signed(dayTotal));
                curDate = t.date;
                dayTotal = 0;
                LinearLayout h = row();
                h.setPadding(dp(8), dp(4), dp(8), dp(6));
                h.addView(tv(Fmt.longDate(t.date, false), 13, SUB, true), lpw(1));
                dayTotalView = tv("", 12, SUB, false);
                h.addView(dayTotalView);
                txListBox.addView(h);
                group = card();
                group.setPadding(0, dp(4), 0, dp(4));
                addCard(txListBox, group);
            } else {
                addDivider(group, 30);
            }
            dayTotal += t.amount;
            group.addView(txRow(t), lp(MATCH, WRAP));
        }
        if (dayTotalView != null) dayTotalView.setText(Fmt.signed(dayTotal));
    }

    View txRow(final Db.Tx t) {
        Db.Category k = catCache.get(t.catId);
        int color = k == null ? SUB : k.color;
        String cname = k == null ? "—" : k.name;
        LinearLayout r = row();
        r.setPadding(dp(14), dp(10), dp(14), dp(10));
        r.setBackground(ripple(null));
        View strip = new View(this);
        strip.setBackground(round(color, 3));
        LinearLayout.LayoutParams sp = lp(dp(4), dp(34));
        sp.setMargins(0, 0, dp(12), 0);
        r.addView(strip, sp);
        LinearLayout texts = col();
        TextView title = tv(t.descr == null || t.descr.isEmpty() ? cname : t.descr, 15, TEXT, true);
        title.setSingleLine(true);
        title.setEllipsize(TextUtils.TruncateAt.END);
        TextView sub = tv(cname + (t.note != null && !t.note.isEmpty() ? " · " + t.note : ""), 12, SUB, false);
        sub.setSingleLine(true);
        sub.setEllipsize(TextUtils.TruncateAt.END);
        texts.addView(title);
        texts.addView(sub);
        r.addView(texts, lpw(1));
        TextView a = tv(Fmt.signed(t.amount), 15, amountColor(t.amount), true);
        a.setPadding(dp(8), 0, 0, 0);
        r.addView(a);
        r.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showTxDialog(t);
            }
        });
        return r;
    }

    void backupBanner(LinearLayout box) {
        long last = prefs.getLong("last_backup", 0);
        long days = (System.currentTimeMillis() - last) / 86400000L;
        if (last != 0 && days < 30) return;
        if (!prefs.getBoolean("has_data", false)) return;
        LinearLayout b = row();
        b.setBackground(ripple(round(0xFFFFF4DE, 12)));
        b.setPadding(dp(14), dp(10), dp(14), dp(10));
        TextView t = tv(last == 0 ? "💾  Δεν έχεις κρατήσει ακόμα αντίγραφο ασφαλείας. Πάτα εδώ για να το αποθηκεύσεις (π.χ. στο Google Drive)."
                : "💾  Τελευταίο αντίγραφο ασφαλείας πριν " + days + " μέρες. Πάτα για νέο.", 13, 0xFF7A5200, false);
        b.addView(t, lpw(1));
        b.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startBackup();
            }
        });
        LinearLayout.LayoutParams p = lp(MATCH, WRAP);
        p.setMargins(dp(2), 0, dp(2), dp(12));
        box.addView(b, p);
    }

    // ================================================================= tab 1: σύνοψη

    View buildSummaryTab() {
        ScrollView sv = new ScrollView(this);
        LinearLayout box = pageBox(sv);
        int ym = ym();
        Map<Long, Double> mt = db.monthTotals(ym);
        Map<Long, Double> prev = db.monthTotals(Fmt.prevYm(ym));
        List<Db.Tx> txs = db.txForMonth(ym);
        double inc = 0, exp = 0;
        for (Db.Tx t : txs) {
            if (t.amount > 0) inc += t.amount;
            else exp += t.amount;
        }
        double net = inc + exp;

        LinearLayout c = card();
        c.setGravity(Gravity.CENTER_HORIZONTAL);
        TextView l = tv("Αποτέλεσμα μήνα", 13, SUB, false);
        c.addView(l);
        c.addView(tv(Fmt.signed(net), 30, amountColor(net), true));
        LinearLayout r = row();
        r.setPadding(0, dp(8), 0, 0);
        r.addView(stat("Έσοδα", Fmt.money(inc), INC), lpw(1));
        r.addView(stat("Έξοδα", Fmt.money(-exp), EXP), lpw(1));
        r.addView(stat("Κινήσεις", String.valueOf(txs.size()), TEXT), lpw(1));
        c.addView(r, lp(MATCH, WRAP));
        addCard(box, c);

        LinearLayout cc = card();
        cc.addView(sectionTitle("Ανά κατηγορία"));
        double max = 0;
        for (Double v : mt.values()) max = Math.max(max, Math.abs(v));
        boolean firstRow = true;
        for (final Db.Category k : catCache.values()) {
            Double v = mt.get(k.id);
            double val = v == null ? 0 : v;
            Double pv = prev.get(k.id);
            if (!firstRow) addDivider(cc, 0);
            firstRow = false;
            LinearLayout item = col();
            item.setPadding(0, dp(9), 0, dp(9));
            item.setBackground(ripple(null));
            LinearLayout top = row();
            top.addView(dot(k.color, 10));
            top.addView(tv(k.name, 14, TEXT, true), lpw(1));
            top.addView(tv(Fmt.signed(val), 15, amountColor(val), true));
            item.addView(top);
            LinearLayout bar = row();
            bar.setBackground(round(DIV, 3));
            float frac = max > 0 ? (float) (Math.abs(val) / max) : 0;
            View fill = new View(this);
            fill.setBackground(round(k.color, 3));
            bar.addView(fill, new LinearLayout.LayoutParams(0, dp(6), frac));
            bar.addView(new View(this), new LinearLayout.LayoutParams(0, dp(6), 1 - frac));
            LinearLayout.LayoutParams bp = lp(MATCH, dp(6));
            bp.setMargins(dp(20), dp(6), 0, dp(4));
            item.addView(bar, bp);
            TextView pt = tv("Προηγούμενος μήνας: " + (pv == null ? "—" : Fmt.signed(pv)), 12, SUB, false);
            pt.setPadding(dp(20), 0, 0, 0);
            item.addView(pt);
            item.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View vv) {
                    filterCat = k.id;
                    search = "";
                    tab = 0;
                    render();
                }
            });
            cc.addView(item, lp(MATCH, WRAP));
        }
        addDivider(cc, 0);
        LinearLayout tot = row();
        tot.setPadding(0, dp(10), 0, dp(2));
        tot.addView(tv("ΣΥΝΟΛΟ ΜΗΝΑ", 14, TEXT, true), lpw(1));
        tot.addView(tv(Fmt.signed(net), 16, amountColor(net), true));
        cc.addView(tot);
        addCard(box, cc);

        if (Db.isPastOrCurrent(ym)) db.copyPrevEnds(ym);
        double[] bt = db.balanceTotals(year).get(ym);
        if (bt != null) {
            LinearLayout bc = card();
            bc.addView(sectionTitle("Λογαριασμοί & υπόλοιπα"));
            LinearLayout br = row();
            br.addView(stat("1η του μήνα", bt[2] > 0 ? Fmt.money(bt[0]) : "—", bt[2] > 0 ? amountColor(bt[0]) : SUB), lpw(1));
            br.addView(stat("Τέλος μήνα", bt[3] > 0 ? Fmt.money(bt[1]) : "—", bt[3] > 0 ? amountColor(bt[1]) : SUB), lpw(1));
            double ch = bt[1] - bt[0];
            br.addView(stat("Μεταβολή", bt[2] > 0 && bt[3] > 0 ? Fmt.signed(ch) : "—", bt[2] > 0 && bt[3] > 0 ? amountColor(ch) : SUB), lpw(1));
            bc.addView(br);
            bc.setBackground(ripple(round(CARD, 14)));
            bc.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    tab = 4;
                    render();
                }
            });
            addCard(box, bc);
        }

        List<Object[]> top = db.topExpenses(ym, 8);
        if (!top.isEmpty()) {
            LinearLayout tc = card();
            tc.addView(sectionTitle("Μεγαλύτερα έξοδα του μήνα"));
            for (int i = 0; i < top.size(); i++) {
                Object[] o = top.get(i);
                if (i > 0) addDivider(tc, 0);
                LinearLayout tr = row();
                tr.setPadding(0, dp(8), 0, dp(8));
                String name = String.valueOf(o[0]);
                int cnt = (Integer) o[2];
                TextView n = tv((i + 1) + ".  " + (name.isEmpty() ? "—" : name) + (cnt > 1 ? "  ×" + cnt : ""), 14, TEXT, false);
                n.setSingleLine(true);
                n.setEllipsize(TextUtils.TruncateAt.END);
                tr.addView(n, lpw(1));
                tr.addView(tv(Fmt.money(-(Double) o[1]), 14, EXP, true));
                final String dn = name;
                tr.setBackground(ripple(null));
                tr.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View vv) {
                        showDescDetail(descKey(dn), dn.isEmpty() ? "—" : dn, false);
                    }
                });
                tc.addView(tr);
            }
            addCard(box, tc);
        }
        return sv;
    }

    // ================================================================= tab 2: ανά έξοδο

    static String descKey(String d) {
        return norm(d == null ? "" : d).replaceAll("\\s+", " ").trim();
    }

    static class DescAgg {
        String key, name;
        double sum, other;
        int count;
        Map<String, Integer> names = new HashMap<String, Integer>();
        java.util.LinkedHashMap<Long, Double> byCat = new java.util.LinkedHashMap<Long, Double>();
    }

    TextView seg(String text, boolean sel) {
        TextView t = tv(text, 14, sel ? Color.WHITE : TEXT, true);
        t.setGravity(Gravity.CENTER);
        t.setPadding(0, dp(8), 0, dp(8));
        t.setBackground(ripple(sel ? round(PRIMARY, 18) : outline(CARD, 0xFFCBD3DA, 18)));
        return t;
    }

    View buildDescTab() {
        ScrollView sv = new ScrollView(this);
        LinearLayout box = pageBox(sv);

        LinearLayout segs = row();
        String[] lbl = {"Μήνας", "Έτος", "Έξοδα", "Έσοδα"};
        for (int i = 0; i < 4; i++) {
            final int idx = i;
            boolean sel = i == 0 ? !descYear : i == 1 ? descYear : i == 2 ? !descIncome : descIncome;
            TextView t = seg(lbl[i], sel);
            t.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (idx == 0) descYear = false;
                    else if (idx == 1) descYear = true;
                    else if (idx == 2) descIncome = false;
                    else descIncome = true;
                    render();
                }
            });
            LinearLayout.LayoutParams p = lpw(1);
            p.setMargins(i == 2 ? dp(14) : dp(3), 0, dp(3), 0);
            segs.addView(t, p);
        }
        LinearLayout.LayoutParams sp0 = lp(MATCH, WRAP);
        sp0.setMargins(0, 0, 0, dp(10));
        box.addView(segs, sp0);

        EditText s = field("🔍  Αναζήτηση (π.χ. σουπερ)");
        s.setText(descSearch);
        s.setBackground(outline(CARD, 0xFFD5DCE2, 12));
        s.setPadding(dp(14), dp(10), dp(14), dp(10));
        s.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence a, int b, int cc, int d) {
            }

            @Override
            public void onTextChanged(CharSequence a, int b, int cc, int d) {
            }

            @Override
            public void afterTextChanged(Editable e) {
                descSearch = e.toString();
                fillDescList();
            }
        });
        LinearLayout.LayoutParams sp = lp(MATCH, WRAP);
        sp.setMargins(dp(2), 0, dp(2), dp(12));
        box.addView(s, sp);

        descListBox = col();
        box.addView(descListBox, lp(MATCH, WRAP));
        fillDescList();
        return sv;
    }

    /** Ομαδοποίηση κινήσεων ανά περιγραφή· other = σύνολο έτους (όταν είμαστε σε μήνα). */
    List<DescAgg> aggregate(boolean yearMode, boolean income) {
        List<Db.Tx> yearTx = db.txForYear(year);
        int ym = ym();
        Map<String, DescAgg> map = new HashMap<String, DescAgg>();
        for (Db.Tx t : yearTx) {
            if (income ? t.amount <= 0 : t.amount >= 0) continue;
            String key = descKey(t.descr);
            if (key.isEmpty()) key = "~" + t.catId;
            DescAgg a = map.get(key);
            if (a == null) {
                a = new DescAgg();
                a.key = key;
                map.put(key, a);
            }
            a.other += t.amount;
            if (!yearMode && t.ym != ym) continue;
            a.sum += t.amount;
            a.count++;
            String nm = t.descr == null || t.descr.trim().isEmpty() ? "" : t.descr.trim();
            Integer c = a.names.get(nm);
            a.names.put(nm, c == null ? 1 : c + 1);
            Double cs = a.byCat.get(t.catId);
            a.byCat.put(t.catId, (cs == null ? 0 : cs) + t.amount);
        }
        List<DescAgg> out = new ArrayList<DescAgg>();
        for (DescAgg a : map.values()) {
            if (a.count == 0) continue;
            String best = null;
            int bc = -1;
            for (Map.Entry<String, Integer> e : a.names.entrySet())
                if (e.getValue() > bc) {
                    bc = e.getValue();
                    best = e.getKey();
                }
            if (best == null || best.isEmpty()) {
                Db.Category k = a.byCat.isEmpty() ? null : catCache.get(a.byCat.keySet().iterator().next());
                best = "(χωρίς περιγραφή)" + (k == null ? "" : " · " + k.name);
            }
            a.name = best;
            out.add(a);
        }
        java.util.Collections.sort(out, new java.util.Comparator<DescAgg>() {
            @Override
            public int compare(DescAgg x, DescAgg y) {
                return Double.compare(Math.abs(y.sum), Math.abs(x.sum));
            }
        });
        return out;
    }

    void fillDescList() {
        if (descListBox == null) return;
        descListBox.removeAllViews();
        List<DescAgg> list = aggregate(descYear, descIncome);
        String q = descKey(descSearch);
        List<DescAgg> shown = new ArrayList<DescAgg>();
        double total = 0;
        for (DescAgg a : list) {
            if (!q.isEmpty() && !a.key.contains(q) && !descKey(a.name).contains(q)) continue;
            shown.add(a);
            total += a.sum;
        }
        int monthsWithData = 0;
        if (descYear) {
            java.util.Set<Integer> ms = new java.util.HashSet<Integer>();
            for (Db.Tx t : db.txForYear(year)) ms.add(t.ym);
            monthsWithData = Math.max(1, ms.size());
        }
        LinearLayout c = card();
        LinearLayout top = row();
        top.addView(tv((descIncome ? "Έσοδα " : "Έξοδα ") + (descYear ? "έτους " + year : Fmt.MONTHS_GEN[month - 1])
                + (q.isEmpty() ? "" : " · «" + descSearch.trim() + "»"), 14, TEXT, true), lpw(1));
        top.addView(tv(Fmt.money(Math.abs(total)), 16, descIncome ? INC : EXP, true));
        c.addView(top);
        c.addView(tv(shown.size() + (shown.size() == 1 ? " περιγραφή" : " περιγραφές") + " · πάτα για ανάλυση ανά μήνα", 12, SUB, false));
        addCard(descListBox, c);

        if (shown.isEmpty()) {
            TextView e = tv("Δεν βρέθηκαν " + (descIncome ? "έσοδα." : "έξοδα."), 15, SUB, false);
            e.setGravity(Gravity.CENTER);
            e.setPadding(dp(16), dp(30), dp(16), dp(30));
            descListBox.addView(e, lp(MATCH, WRAP));
            return;
        }
        LinearLayout lc = card();
        lc.setPadding(0, dp(4), 0, dp(4));
        for (int i = 0; i < shown.size(); i++) {
            final DescAgg a = shown.get(i);
            if (i > 0) addDivider(lc, 14);
            LinearLayout r = row();
            r.setPadding(dp(14), dp(10), dp(14), dp(10));
            r.setBackground(ripple(null));
            LinearLayout texts = col();
            TextView n = tv(a.name, 15, TEXT, true);
            n.setSingleLine(true);
            n.setEllipsize(TextUtils.TruncateAt.END);
            texts.addView(n);
            StringBuilder sub = new StringBuilder();
            sub.append(a.count).append(a.count == 1 ? " φορά" : " φορές");
            int ci = 0;
            for (Long cid : a.byCat.keySet()) {
                Db.Category k = catCache.get(cid);
                if (k == null) continue;
                sub.append(ci++ == 0 ? " · " : ", ").append(k.name);
            }
            if (descYear) sub.append(" · Μ.Ο. ").append(Fmt.money(Math.abs(a.sum) / monthsWithData)).append("/μήνα");
            else sub.append(" · έτος ").append(Fmt.money(Math.abs(a.other)));
            TextView st = tv(sub.toString(), 12, SUB, false);
            st.setMaxLines(2);
            st.setEllipsize(TextUtils.TruncateAt.END);
            texts.addView(st);
            r.addView(texts, lpw(1));
            TextView amt = tv(Fmt.money(Math.abs(a.sum)), 15, descIncome ? INC : EXP, true);
            amt.setPadding(dp(8), 0, 0, 0);
            r.addView(amt);
            r.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    showDescDetail(a.key, a.name, descIncome);
                }
            });
            lc.addView(r, lp(MATCH, WRAP));
        }
        addCard(descListBox, lc);
    }

    /** Ανάλυση μιας περιγραφής για όλο το έτος: ανά μήνα και ανά κατηγορία. */
    void showDescDetail(final String key, final String name, boolean income) {
        double[] perMonth = new double[13];
        int[] cnt = new int[13];
        Map<Long, Double> byCat = new java.util.LinkedHashMap<Long, Double>();
        double total = 0;
        int n = 0;
        for (Db.Tx t : db.txForYear(year)) {
            if (income ? t.amount <= 0 : t.amount >= 0) continue;
            String k = descKey(t.descr);
            if (k.isEmpty()) k = "~" + t.catId;
            if (!k.equals(key)) continue;
            int m = t.ym % 100;
            perMonth[m] += t.amount;
            cnt[m]++;
            total += t.amount;
            n++;
            Double c = byCat.get(t.catId);
            byCat.put(t.catId, (c == null ? 0 : c) + t.amount);
        }
        final AlertDialog[] holder = new AlertDialog[1];
        LinearLayout v = dialogBox();
        int col = income ? INC : EXP;
        LinearLayout tr = row();
        tr.setPadding(0, dp(4), 0, dp(8));
        tr.addView(stat("Σύνολο " + year, Fmt.money(Math.abs(total)), col), lpw(1));
        int monthsWith = 0;
        for (int m = 1; m <= 12; m++) if (cnt[m] > 0) monthsWith++;
        tr.addView(stat("Φορές", String.valueOf(n), TEXT), lpw(1));
        tr.addView(stat("Μ.Ο./μήνα", monthsWith == 0 ? "—" : Fmt.money(Math.abs(total) / monthsWith), SUB), lpw(1));
        v.addView(tr, lp(MATCH, WRAP));
        double max = 0;
        for (int m = 1; m <= 12; m++) max = Math.max(max, Math.abs(perMonth[m]));
        for (int m = 1; m <= 12; m++) {
            final int mm = m;
            LinearLayout r = row();
            r.setPadding(0, dp(6), 0, dp(6));
            r.setBackground(ripple(null));
            TextView ml = tv(Fmt.MONTHS_SHORT[m - 1], 13, m == month ? PRIMARY : TEXT, m == month);
            r.addView(ml, lp(dp(42), WRAP));
            LinearLayout bar = row();
            float frac = max > 0 ? (float) (Math.abs(perMonth[m]) / max) : 0;
            View fill = new View(this);
            fill.setBackground(round(col, 3));
            bar.addView(fill, new LinearLayout.LayoutParams(0, dp(8), frac));
            bar.addView(new View(this), new LinearLayout.LayoutParams(0, dp(8), 1 - frac));
            r.addView(bar, lpw(1));
            TextView val = tv(cnt[m] == 0 ? "—" : Fmt.money(Math.abs(perMonth[m])) + (cnt[m] > 1 ? " (" + cnt[m] + ")" : ""), 13, cnt[m] == 0 ? 0xFFB0B8C0 : TEXT, cnt[m] > 0);
            val.setGravity(Gravity.END);
            r.addView(val, lp(dp(110), WRAP));
            if (cnt[m] > 0) r.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View vv) {
                    holder[0].dismiss();
                    month = mm;
                    tab = 0;
                    filterCat = null;
                    search = key.startsWith("~") ? "" : name;
                    render();
                }
            });
            v.addView(r, lp(MATCH, WRAP));
        }
        if (byCat.size() > 1) {
            v.addView(label("Ανά κατηγορία"));
            for (Map.Entry<Long, Double> e : byCat.entrySet()) {
                Db.Category k = catCache.get(e.getKey());
                LinearLayout r = row();
                r.setPadding(0, dp(3), 0, dp(3));
                if (k != null) r.addView(dot(k.color, 10));
                r.addView(tv(k == null ? "—" : k.name, 13, TEXT, false), lpw(1));
                r.addView(tv(Fmt.money(Math.abs(e.getValue())), 13, TEXT, true));
                v.addView(r, lp(MATCH, WRAP));
            }
        }
        TextView hint = tv("Πάτα σε μήνα για να δεις τις κινήσεις του.", 12, SUB, false);
        hint.setPadding(0, dp(10), 0, 0);
        v.addView(hint);
        holder[0] = new AlertDialog.Builder(this)
                .setTitle(name)
                .setView(scroll(v))
                .setPositiveButton("OK", null)
                .create();
        holder[0].show();
    }

    // ================================================================= tab 3: έτος

    TextView cell(String s, int color, boolean bold, boolean right) {
        TextView t = tv(s, 13, color, bold);
        t.setPadding(dp(10), dp(9), dp(10), dp(9));
        t.setGravity(right ? Gravity.END | Gravity.CENTER_VERTICAL : Gravity.START | Gravity.CENTER_VERTICAL);
        t.setMinWidth(dp(right ? 86 : 64));
        t.setSingleLine(true);
        return t;
    }

    View buildYearTab() {
        ScrollView sv = new ScrollView(this);
        LinearLayout box = pageBox(sv);
        List<Db.Category> cats = new ArrayList<Db.Category>(catCache.values());
        Map<Integer, Map<Long, Double>> mx = db.yearMatrix(year);
        Map<Integer, double[]> bt = db.balanceTotals(year);
        double inc = 0, exp = 0;
        for (Db.Tx t : db.txForYear(year)) {
            if (t.amount > 0) inc += t.amount;
            else exp += t.amount;
        }

        LinearLayout c = card();
        LinearLayout r = row();
        r.addView(stat("Έσοδα έτους", Fmt.money(inc), INC), lpw(1));
        r.addView(stat("Έξοδα έτους", Fmt.money(-exp), EXP), lpw(1));
        r.addView(stat("Αποτέλεσμα", Fmt.signed(inc + exp), amountColor(inc + exp)), lpw(1));
        c.addView(r);
        addCard(box, c);

        TextView hint = tv("Πάτα σε μήνα για να δεις τις κινήσεις του · σύρε οριζόντια για όλες τις στήλες", 12, SUB, false);
        hint.setPadding(dp(6), 0, dp(6), dp(8));
        box.addView(hint);

        LinearLayout tc = card();
        tc.setPadding(0, dp(4), 0, dp(4));
        HorizontalScrollView hs = new HorizontalScrollView(this);
        TableLayout table = new TableLayout(this);
        hs.addView(table);
        tc.addView(hs, lp(MATCH, WRAP));

        TableRow hr = new TableRow(this);
        hr.addView(cell("Μήνας", SUB, true, false));
        for (Db.Category k : cats) {
            TextView h = cell(k.name, k.color, true, true);
            hr.addView(h);
        }
        hr.addView(cell("Σύνολο", TEXT, true, true));
        hr.addView(cell("Λογ/σμοί τέλος", SUB, true, true));
        table.addView(hr);

        double[] colSum = new double[cats.size() + 1];
        int monthsWithData = 0;
        Calendar now = Calendar.getInstance();
        int curYm = Fmt.ym(now.get(Calendar.YEAR), now.get(Calendar.MONTH) + 1);
        for (int m = 1; m <= 12; m++) {
            final int mm = m;
            int ymv = Fmt.ym(year, m);
            Map<Long, Double> row = mx.get(ymv);
            double[] b = bt.get(ymv);
            TableRow tr = new TableRow(this);
            tr.setBackground(ripple(ymv == curYm ? new ColorDrawable(0xFFF1F7F9) : null));
            tr.addView(cell(Fmt.MONTHS_SHORT[m - 1], TEXT, true, false));
            double total = 0;
            for (int i = 0; i < cats.size(); i++) {
                Double v = row == null ? null : row.get(cats.get(i).id);
                if (v != null) {
                    total += v;
                    colSum[i] += v;
                }
                tr.addView(cell(row == null ? "—" : v == null ? "0" : Fmt.num(v), v == null ? 0xFFB0B8C0 : amountColor(v), false, true));
            }
            if (row != null) {
                colSum[cats.size()] += total;
                monthsWithData++;
            }
            tr.addView(cell(row == null ? "—" : Fmt.num(total), row == null ? 0xFFB0B8C0 : amountColor(total), true, true));
            tr.addView(cell(b != null && b[3] > 0 ? Fmt.num(b[1]) : "—", b != null && b[3] > 0 ? amountColor(b[1]) : 0xFFB0B8C0, false, true));
            tr.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    month = mm;
                    tab = 0;
                    render();
                }
            });
            table.addView(tr);
        }
        TableRow sep = new TableRow(this);
        View line = divider();
        sep.addView(line, new TableRow.LayoutParams(MATCH, dp(1)));
        TableRow.LayoutParams slp = (TableRow.LayoutParams) line.getLayoutParams();
        slp.span = cats.size() + 3;
        table.addView(sep);

        TableRow tot = new TableRow(this);
        tot.addView(cell("Σύνολο", TEXT, true, false));
        for (int i = 0; i <= cats.size(); i++) tot.addView(cell(Fmt.num(colSum[i]), amountColor(colSum[i]), true, true));
        tot.addView(cell("", SUB, false, true));
        table.addView(tot);
        if (monthsWithData > 0) {
            TableRow avg = new TableRow(this);
            avg.addView(cell("Μ.Ο.", SUB, true, false));
            for (int i = 0; i <= cats.size(); i++) {
                double a = colSum[i] / monthsWithData;
                avg.addView(cell(Fmt.num(Math.round(a)), SUB, false, true));
            }
            avg.addView(cell("", SUB, false, true));
            table.addView(avg);
        }
        addCard(box, tc);
        return sv;
    }

    // ================================================================= tab 4: λογαριασμοί

    View buildAccountsTab() {
        ScrollView sv = new ScrollView(this);
        LinearLayout box = pageBox(sv);
        final int ym = ym();
        if (Db.isPastOrCurrent(ym)) db.copyPrevEnds(ym);
        List<Db.Account> accs = db.accounts();
        Map<Long, Db.Balance> bal = db.balances(ym);
        java.util.Set<Long> hiddenSet = db.hiddenAccounts(ym);

        TextView hint = tv("Η 1η του μήνα συμπληρώνεται αυτόματα από το τέλος του προηγούμενου μήνα· εσύ γράφεις το τέλος. "
                + "Δάνεια και χρέη με αρνητικό πρόσημο. Πάτα σε λογαριασμό για επεξεργασία, κράτα πατημένο για επιλογές "
                + "(π.χ. αφαίρεση μόνο από αυτόν τον μήνα).", 12, SUB, false);
        hint.setPadding(dp(6), 0, dp(6), dp(10));
        box.addView(hint);

        LinearLayout c = card();
        c.setPadding(0, dp(6), 0, dp(6));
        LinearLayout h = row();
        h.setPadding(dp(14), dp(4), dp(14), dp(8));
        h.addView(tv("Λογαριασμός", 12, SUB, true), new LinearLayout.LayoutParams(0, WRAP, 1.3f));
        TextView h1 = tv("1η μήνα", 12, SUB, true);
        h1.setGravity(Gravity.END);
        TextView h2 = tv("Τέλος μήνα", 12, SUB, true);
        h2.setGravity(Gravity.END);
        h.addView(h1, lpw(1));
        h.addView(h2, lpw(1));
        c.addView(h);

        double sStart = 0, sEnd = 0;
        int nStart = 0, nEnd = 0, hidden = 0, shown = 0;
        for (final Db.Account a : accs) {
            final Db.Balance b = bal.get(a.id);
            final boolean hm = hiddenSet.contains(a.id);
            if (!showHidden && (hm || (a.archived && b == null))) {
                hidden++;
                continue;
            }
            shown++;
            addDivider(c, 14);
            LinearLayout r = row();
            r.setPadding(dp(14), dp(11), dp(14), dp(11));
            r.setBackground(ripple(null));
            boolean dim = a.archived || hm;
            TextView n = tv(a.name + (hm ? "\n(αφαιρέθηκε από τον μήνα)" : ""), 14, dim ? SUB : TEXT, !dim);
            n.setEllipsize(TextUtils.TruncateAt.END);
            n.setMaxLines(3);
            r.addView(n, new LinearLayout.LayoutParams(0, WRAP, 1.3f));
            TextView v1 = tv(b == null || b.start == null ? "—" : Fmt.num(b.start), 14, b == null || b.start == null ? 0xFFB0B8C0 : amountColor(b.start), false);
            v1.setGravity(Gravity.END);
            TextView v2 = tv(b == null || b.end == null ? "—" : Fmt.num(b.end), 14, b == null || b.end == null ? 0xFFB0B8C0 : amountColor(b.end), true);
            v2.setGravity(Gravity.END);
            r.addView(v1, lpw(1));
            r.addView(v2, lpw(1));
            if (b != null && b.start != null) {
                sStart += b.start;
                nStart++;
            }
            if (b != null && b.end != null) {
                sEnd += b.end;
                nEnd++;
            }
            r.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    editBalance(a, b);
                }
            });
            r.setOnLongClickListener(new View.OnLongClickListener() {
                @Override
                public boolean onLongClick(View v) {
                    accountOptions(a, hm);
                    return true;
                }
            });
            c.addView(r);
        }
        if (shown == 0) {
            TextView e = tv(accs.isEmpty() ? "Δεν υπάρχουν λογαριασμοί ακόμα.\nΠρόσθεσε π.χ. VIVA, ΜΕΤΡΗΤΑ, ΔΑΝΕΙΟ…" : "Δεν υπάρχουν λογαριασμοί για αυτόν τον μήνα.", 14, SUB, false);
            e.setGravity(Gravity.CENTER);
            e.setPadding(dp(16), dp(20), dp(16), dp(20));
            c.addView(e, lp(MATCH, WRAP));
        } else {
            LinearLayout sep = new LinearLayout(this);
            sep.setBackgroundColor(0xFFB8C2CC);
            c.addView(sep, lp(MATCH, dp(1)));
            LinearLayout t = row();
            t.setPadding(dp(14), dp(11), dp(14), dp(4));
            t.addView(tv("ΣΥΝΟΛΟ", 14, TEXT, true), new LinearLayout.LayoutParams(0, WRAP, 1.3f));
            TextView t1 = tv(nStart > 0 ? Fmt.num(sStart) : "—", 14, amountColor(sStart), true);
            t1.setGravity(Gravity.END);
            TextView t2 = tv(nEnd > 0 ? Fmt.num(sEnd) : "—", 14, amountColor(sEnd), true);
            t2.setGravity(Gravity.END);
            t.addView(t1, lpw(1));
            t.addView(t2, lpw(1));
            c.addView(t);
            if (nStart > 0 && nEnd > 0) {
                double ch = sEnd - sStart;
                LinearLayout cr = row();
                cr.setPadding(dp(14), dp(2), dp(14), dp(8));
                cr.addView(tv("Μεταβολή μήνα", 13, SUB, false), lpw(1));
                cr.addView(tv(Fmt.signed(ch), 14, amountColor(ch), true));
                c.addView(cr);
            }
        }
        addCard(box, c);

        TextView add = button("+ Νέος λογαριασμός", true);
        add.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addAccountDialog();
            }
        });
        LinearLayout.LayoutParams ap = lp(MATCH, WRAP);
        ap.setMargins(dp(2), 0, dp(2), 0);
        box.addView(add, ap);

        if (hidden > 0 || showHidden) {
            TextView sh = tv(showHidden ? "Απόκρυψη αφαιρεμένων / κρυφών" : "Εμφάνιση αφαιρεμένων / κρυφών (" + hidden + ")", 13, PRIMARY, true);
            sh.setGravity(Gravity.CENTER);
            sh.setPadding(0, dp(16), 0, dp(8));
            sh.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    showHidden = !showHidden;
                    render();
                }
            });
            box.addView(sh, lp(MATCH, WRAP));
        }
        return sv;
    }

    void editBalance(final Db.Account a, Db.Balance b) {
        final int ym = ym();
        LinearLayout v = dialogBox();
        final Db.Balance pb = db.balances(Fmt.prevYm(ym)).get(a.id);
        v.addView(label("Υπόλοιπο 1ης " + Fmt.MONTHS_GEN[month - 1]));
        final EditText s = moneyField("π.χ. 1500 ή -5797", true);
        if (b != null && b.start != null) s.setText(Fmt.plain(b.start));
        v.addView(s, lp(MATCH, WRAP));
        if (pb != null && pb.end != null) {
            final TextView use = tv("↳ Τέλος προηγ. μήνα: " + Fmt.num(pb.end) + "  (πάτα για χρήση)", 13, PRIMARY, false);
            use.setPadding(0, dp(4), 0, dp(4));
            use.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View vv) {
                    s.setText(Fmt.plain(pb.end));
                }
            });
            v.addView(use);
        }
        v.addView(label("Υπόλοιπο τέλους μήνα"));
        final EditText e = moneyField("π.χ. 1650 ή -5616", true);
        if (b != null && b.end != null) e.setText(Fmt.plain(b.end));
        v.addView(e, lp(MATCH, WRAP));
        TextView note = tv("Το τέλος του μήνα περνάει αυτόματα ως 1η του επόμενου. Δάνεια, πιστωτικές και χρέη με αρνητικό πρόσημο.", 12, SUB, false);
        note.setPadding(0, dp(10), 0, 0);
        v.addView(note);

        final AlertDialog d = new AlertDialog.Builder(this)
                .setTitle(a.name)
                .setView(scroll(v))
                .setPositiveButton("Αποθήκευση", null)
                .setNegativeButton("Άκυρο", null)
                .setNeutralButton("Αφαίρεση από μήνα", null)
                .create();
        d.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface di) {
                d.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View vv) {
                        String ss = s.getText().toString().trim(), es = e.getText().toString().trim();
                        Double sv = Fmt.parse(ss), ev = Fmt.parse(es);
                        if (!ss.isEmpty() && sv == null) {
                            s.setError("Μη έγκυρο ποσό");
                            return;
                        }
                        if (!es.isEmpty() && ev == null) {
                            e.setError("Μη έγκυρο ποσό");
                            return;
                        }
                        db.setHiddenInMonth(a.id, ym, false);
                        db.saveBalance(a.id, ym, sv, ev);
                        markData();
                        d.dismiss();
                        render();
                    }
                });
                Button rm = d.getButton(AlertDialog.BUTTON_NEUTRAL);
                rm.setTextColor(EXP);
                rm.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View vv) {
                        d.dismiss();
                        confirmHideInMonth(a);
                    }
                });
            }
        });
        d.show();
    }

    void confirmHideInMonth(final Db.Account a) {
        final int ym = ym();
        new AlertDialog.Builder(this)
                .setTitle("Αφαίρεση από τον μήνα")
                .setMessage("Ο «" + a.name + "» θα αφαιρεθεί μόνο από τον " + Fmt.monthTitle(year, month)
                        + " (σβήνουν τα υπόλοιπά του σε αυτόν τον μήνα). Στους άλλους μήνες μένει όπως είναι.")
                .setPositiveButton("Αφαίρεση", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int w) {
                        db.setHiddenInMonth(a.id, ym, true);
                        render();
                        toast("Αφαιρέθηκε από τον " + Fmt.MONTHS[month - 1]);
                    }
                })
                .setNegativeButton("Άκυρο", null)
                .show();
    }

    void addAccountDialog() {
        LinearLayout v = dialogBox();
        final EditText n = field("Όνομα (π.χ. VIVA, ΜΕΤΡΗΤΑ)");
        n.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS);
        v.addView(n, lp(MATCH, WRAP));
        final AlertDialog d = new AlertDialog.Builder(this)
                .setTitle("Νέος λογαριασμός")
                .setView(v)
                .setPositiveButton("Προσθήκη", null)
                .setNegativeButton("Άκυρο", null)
                .create();
        d.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface di) {
                d.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View vv) {
                        String name = n.getText().toString().trim();
                        if (name.isEmpty()) {
                            n.setError("Γράψε όνομα");
                            return;
                        }
                        db.addAccount(name);
                        d.dismiss();
                        render();
                    }
                });
            }
        });
        showWithKeyboard(d, n);
    }

    void accountOptions(final Db.Account a, final boolean hiddenInMonth) {
        final String mName = Fmt.monthTitle(year, month);
        String[] items = {hiddenInMonth ? "Επαναφορά στον " + mName : "Αφαίρεση μόνο από τον " + mName,
                "Μετονομασία", a.archived ? "Εμφάνιση σε όλους τους μήνες" : "Απόκρυψη από μήνες χωρίς υπόλοιπα",
                "▲ Μετακίνηση πάνω", "▼ Μετακίνηση κάτω", "Διαγραφή από ΟΛΟΥΣ τους μήνες"};
        new AlertDialog.Builder(this)
                .setTitle(a.name)
                .setItems(items, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface di, int which) {
                        switch (which) {
                            case 0:
                                if (hiddenInMonth) {
                                    db.setHiddenInMonth(a.id, ym(), false);
                                    render();
                                } else confirmHideInMonth(a);
                                break;
                            case 1: renameAccount(a); break;
                            case 2: db.setArchived(a.id, !a.archived); render(); break;
                            case 3: db.moveAccount(a.id, -1); render(); break;
                            case 4: db.moveAccount(a.id, 1); render(); break;
                            case 5:
                                new AlertDialog.Builder(MainActivity.this)
                                        .setTitle("Διαγραφή λογαριασμού")
                                        .setMessage("Να διαγραφεί ο «" + a.name + "» μαζί με όλα τα υπόλοιπά του σε ΟΛΟΥΣ τους μήνες;\n\nΑν θες να φύγει μόνο από αυτόν τον μήνα, διάλεξε «Αφαίρεση μόνο από τον " + mName + "».")
                                        .setPositiveButton("Διαγραφή", new DialogInterface.OnClickListener() {
                                            @Override
                                            public void onClick(DialogInterface d2, int w) {
                                                db.deleteAccount(a.id);
                                                render();
                                            }
                                        })
                                        .setNegativeButton("Άκυρο", null)
                                        .show();
                                break;
                        }
                    }
                })
                .show();
    }
    void renameAccount(final Db.Account a) {
        LinearLayout v = dialogBox();
        final EditText n = field("Όνομα");
        n.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS);
        n.setText(a.name);
        v.addView(n, lp(MATCH, WRAP));
        new AlertDialog.Builder(this)
                .setTitle("Μετονομασία")
                .setView(v)
                .setPositiveButton("Αποθήκευση", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int w) {
                        String name = n.getText().toString().trim();
                        if (!name.isEmpty()) db.renameAccount(a.id, name);
                        render();
                    }
                })
                .setNegativeButton("Άκυρο", null)
                .show();
    }

    // ================================================================= προσθήκη / επεξεργασία κίνησης

    void showWithKeyboard(AlertDialog d, View focus) {
        if (d.getWindow() != null)
            d.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE);
        d.show();
        focus.requestFocus();
    }

    void showTxDialog(final Db.Tx existing) {
        final List<Db.Category> cats = db.categories();
        if (cats.isEmpty()) {
            toast("Πρόσθεσε πρώτα μια κατηγορία από το μενού ⋮");
            return;
        }
        final Map<Long, Db.Category> cmap = new HashMap<Long, Db.Category>();
        for (Db.Category k : cats) cmap.put(k.id, k);

        final long[] sel = new long[1];
        final boolean[] income = new boolean[1];
        final String[] date = new String[1];
        if (existing != null) {
            sel[0] = existing.catId;
            income[0] = existing.amount > 0;
            date[0] = existing.date;
        } else {
            Db.Category def = null;
            if (filterCat != null) def = cmap.get(filterCat);
            if (def == null) for (Db.Category k : cats) if ("OUT".equals(k.kind)) {
                def = k;
                break;
            }
            if (def == null) def = cats.get(0);
            sel[0] = def.id;
            income[0] = "IN".equals(def.kind);
            Calendar now = Calendar.getInstance();
            if (now.get(Calendar.YEAR) == year && now.get(Calendar.MONTH) + 1 == month)
                date[0] = Fmt.date(year, month, now.get(Calendar.DAY_OF_MONTH));
            else date[0] = Fmt.date(year, month, 1);
        }
        if (!cmap.containsKey(sel[0])) sel[0] = cats.get(0).id;

        LinearLayout v = dialogBox();

        // τύπος
        LinearLayout tg = row();
        final TextView bOut = tv("−  Έξοδο", 15, TEXT, true);
        final TextView bIn = tv("+  Έσοδο", 15, TEXT, true);
        bOut.setGravity(Gravity.CENTER);
        bIn.setGravity(Gravity.CENTER);
        bOut.setPadding(0, dp(10), 0, dp(10));
        bIn.setPadding(0, dp(10), 0, dp(10));
        LinearLayout.LayoutParams p1 = lpw(1);
        p1.setMargins(0, dp(6), dp(5), 0);
        LinearLayout.LayoutParams p2 = lpw(1);
        p2.setMargins(dp(5), dp(6), 0, 0);
        tg.addView(bOut, p1);
        tg.addView(bIn, p2);
        v.addView(tg, lp(MATCH, WRAP));

        final EditText amt = moneyField("Ποσό €", false);
        amt.setTextSize(TypedValue.COMPLEX_UNIT_SP, 26);
        amt.setTypeface(Typeface.DEFAULT_BOLD);
        if (existing != null) amt.setText(Fmt.plain(Math.abs(existing.amount)));
        LinearLayout.LayoutParams ap = lp(MATCH, WRAP);
        ap.setMargins(0, dp(10), 0, 0);
        v.addView(amt, ap);

        v.addView(label("Κατηγορία"));
        final FlowLayout fl = new FlowLayout(this, dp(8), dp(8));
        v.addView(fl, lp(MATCH, WRAP));

        v.addView(label("Περιγραφή"));
        final AutoCompleteTextView desc = new AutoCompleteTextView(this);
        desc.setHint("π.χ. ΣΟΥΠΕΡ ΜΑΡΚΕΤ");
        desc.setSingleLine(true);
        desc.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        desc.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS);
        desc.setThreshold(1);
        if (existing != null) desc.setText(existing.descr);
        final Map<String, Db.Suggestion> sugMap = new HashMap<String, Db.Suggestion>();
        List<String> names = new ArrayList<String>();
        for (Db.Suggestion s : db.suggestions()) {
            sugMap.put(s.descr, s);
            names.add(s.descr);
        }
        desc.setAdapter(new ArrayAdapter<String>(this, android.R.layout.simple_dropdown_item_1line, names));
        v.addView(desc, lp(MATCH, WRAP));

        v.addView(label("Ημερομηνία"));
        final TextView dateBtn = button("📅  " + Fmt.longDate(date[0], true), false);
        dateBtn.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        v.addView(dateBtn, lp(MATCH, WRAP));

        v.addView(label("Σημείωση"));
        final EditText note = field("προαιρετικά");
        note.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        if (existing != null) note.setText(existing.note);
        v.addView(note, lp(MATCH, WRAP));

        final Runnable paint = new Runnable() {
            @Override
            public void run() {
                bOut.setBackground(ripple(!income[0] ? round(EXP, 12) : outline(CARD, 0xFFCBD3DA, 12)));
                bOut.setTextColor(!income[0] ? Color.WHITE : TEXT);
                bIn.setBackground(ripple(income[0] ? round(INC, 12) : outline(CARD, 0xFFCBD3DA, 12)));
                bIn.setTextColor(income[0] ? Color.WHITE : TEXT);
                amt.setTextColor(income[0] ? INC : EXP);
                fl.removeAllViews();
                for (final Db.Category k : cats) {
                    TextView ch = chip(k.name, k.id == sel[0], k.color);
                    final Runnable self = this;
                    ch.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View vv) {
                            sel[0] = k.id;
                            if ("IN".equals(k.kind)) income[0] = true;
                            else if ("OUT".equals(k.kind)) income[0] = false;
                            self.run();
                        }
                    });
                    fl.addView(ch);
                }
            }
        };
        paint.run();
        bOut.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View vv) {
                income[0] = false;
                paint.run();
            }
        });
        bIn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View vv) {
                income[0] = true;
                paint.run();
            }
        });
        desc.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int pos, long id) {
                Object o = parent.getItemAtPosition(pos);
                Db.Suggestion s = o == null ? null : sugMap.get(o.toString());
                if (s != null && cmap.containsKey(s.catId)) {
                    sel[0] = s.catId;
                    income[0] = s.income;
                    paint.run();
                }
            }
        });
        dateBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View vv) {
                int[] p = Fmt.splitDate(date[0]);
                new DatePickerDialog(MainActivity.this, new DatePickerDialog.OnDateSetListener() {
                    @Override
                    public void onDateSet(DatePicker dp, int y, int m, int d) {
                        date[0] = Fmt.date(y, m + 1, d);
                        dateBtn.setText("📅  " + Fmt.longDate(date[0], true));
                    }
                }, p[0], p[1] - 1, p[2]).show();
            }
        });

        AlertDialog.Builder b = new AlertDialog.Builder(this)
                .setTitle(existing == null ? "Νέα κίνηση" : "Επεξεργασία κίνησης")
                .setView(scroll(v))
                .setPositiveButton("Αποθήκευση", null)
                .setNegativeButton("Άκυρο", null)
                .setNeutralButton(existing == null ? "+ Άλλη μία" : "Διαγραφή", null);
        final AlertDialog d = b.create();

        // επιστρέφει true αν αποθηκεύτηκε
        final java.util.concurrent.Callable<Boolean> save = new java.util.concurrent.Callable<Boolean>() {
            @Override
            public Boolean call() {
                Double a = Fmt.parse(amt.getText().toString());
                if (a == null || Math.abs(a) < 0.005) {
                    amt.setError("Γράψε ποσό");
                    amt.requestFocus();
                    return false;
                }
                Db.Tx t = existing != null ? existing : new Db.Tx();
                t.amount = income[0] ? Math.abs(a) : -Math.abs(a);
                t.catId = sel[0];
                t.descr = desc.getText().toString().trim();
                t.note = note.getText().toString().trim();
                t.date = date[0];
                db.saveTx(t);
                markData();
                int[] p = Fmt.splitDate(t.date);
                year = p[0];
                month = p[1];
                return true;
            }
        };
        d.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface di) {
                d.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View vv) {
                        try {
                            if (save.call()) {
                                d.dismiss();
                                render();
                            }
                        } catch (Exception ex) {
                            toast("Σφάλμα: " + ex.getMessage());
                        }
                    }
                });
                Button neutral = d.getButton(AlertDialog.BUTTON_NEUTRAL);
                if (existing != null) neutral.setTextColor(EXP);
                neutral.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View vv) {
                        if (existing != null) {
                            new AlertDialog.Builder(MainActivity.this)
                                    .setMessage("Να διαγραφεί η κίνηση «" + (existing.descr.isEmpty() ? "—" : existing.descr) + "» " + Fmt.signed(existing.amount) + ";")
                                    .setPositiveButton("Διαγραφή", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface x, int w) {
                                            db.deleteTx(existing.id);
                                            d.dismiss();
                                            render();
                                        }
                                    })
                                    .setNegativeButton("Άκυρο", null)
                                    .show();
                        } else {
                            try {
                                if (save.call()) {
                                    toast("Αποθηκεύτηκε · γράψε την επόμενη");
                                    amt.setText("");
                                    desc.setText("");
                                    note.setText("");
                                    amt.requestFocus();
                                    render();
                                }
                            } catch (Exception ex) {
                                toast("Σφάλμα: " + ex.getMessage());
                            }
                        }
                    }
                });
            }
        });
        if (existing == null) showWithKeyboard(d, amt);
        else d.show();
    }

    void markData() {
        if (!prefs.getBoolean("has_data", false)) prefs.edit().putBoolean("has_data", true).apply();
    }

    // ================================================================= κατηγορίες

    void showCategories() {
        final List<Db.Category> cats = db.categories();
        LinearLayout v = dialogBox();
        final AlertDialog[] holder = new AlertDialog[1];
        for (int i = 0; i < cats.size(); i++) {
            final Db.Category k = cats.get(i);
            LinearLayout r = row();
            r.setPadding(0, dp(8), 0, dp(8));
            r.addView(dot(k.color, 14));
            LinearLayout t = col();
            t.addView(tv(k.name, 15, TEXT, true));
            t.addView(tv(kindLabel(k.kind) + " · " + db.countTx(k.id) + " κινήσεις", 12, SUB, false));
            t.setBackground(ripple(null));
            t.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View vv) {
                    holder[0].dismiss();
                    editCategory(k);
                }
            });
            r.addView(t, lpw(1));
            TextView up = tv("▲", 16, i == 0 ? DIV : SUB, false);
            up.setPadding(dp(12), dp(6), dp(12), dp(6));
            up.setBackground(ripple(null));
            up.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View vv) {
                    db.moveCategory(k.id, -1);
                    holder[0].dismiss();
                    render();
                    showCategories();
                }
            });
            TextView down = tv("▼", 16, i == cats.size() - 1 ? DIV : SUB, false);
            down.setPadding(dp(12), dp(6), dp(12), dp(6));
            down.setBackground(ripple(null));
            down.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View vv) {
                    db.moveCategory(k.id, 1);
                    holder[0].dismiss();
                    render();
                    showCategories();
                }
            });
            r.addView(up);
            r.addView(down);
            v.addView(r, lp(MATCH, WRAP));
        }
        TextView hint = tv("Πάτα σε κατηγορία για αλλαγή ονόματος, χρώματος ή διαγραφή.", 12, SUB, false);
        hint.setPadding(0, dp(8), 0, 0);
        v.addView(hint);
        holder[0] = new AlertDialog.Builder(this)
                .setTitle("Κατηγορίες")
                .setView(scroll(v))
                .setPositiveButton("Κλείσιμο", null)
                .setNeutralButton("+ Νέα", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int w) {
                        editCategory(null);
                    }
                })
                .create();
        holder[0].show();
    }

    static String kindLabel(String kind) {
        if ("IN".equals(kind)) return "Έσοδα";
        if ("OUT".equals(kind)) return "Έξοδα";
        return "Έσοδα & έξοδα";
    }

    void editCategory(final Db.Category existing) {
        LinearLayout v = dialogBox();
        v.addView(label("Όνομα"));
        final EditText n = field("π.χ. ΑΥΤΟΚΙΝΗΤΟ");
        n.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS);
        if (existing != null) n.setText(existing.name);
        v.addView(n, lp(MATCH, WRAP));

        v.addView(label("Τι γράφεις εδώ"));
        final RadioGroup rg = new RadioGroup(this);
        String[] kinds = {"OUT", "IN", "BOTH"};
        final RadioButton[] rbs = new RadioButton[3];
        for (int i = 0; i < 3; i++) {
            rbs[i] = new RadioButton(this);
            rbs[i].setId(100 + i);
            rbs[i].setText(i == 0 ? "Μόνο έξοδα" : i == 1 ? "Μόνο έσοδα" : "Και έσοδα και έξοδα (π.χ. ακίνητο)");
            rg.addView(rbs[i]);
        }
        String k0 = existing == null ? "OUT" : existing.kind;
        rg.check(100 + ("IN".equals(k0) ? 1 : "BOTH".equals(k0) ? 2 : 0));
        v.addView(rg);

        v.addView(label("Χρώμα"));
        final int[] color = {existing == null ? Db.PALETTE[db.categories().size() % Db.PALETTE.length] : existing.color};
        final FlowLayout fl = new FlowLayout(this, dp(10), dp(10));
        final Runnable paint = new Runnable() {
            @Override
            public void run() {
                fl.removeAllViews();
                for (final int c : Db.PALETTE) {
                    View sw = new View(MainActivity.this);
                    GradientDrawable g = new GradientDrawable();
                    g.setShape(GradientDrawable.OVAL);
                    g.setColor(c);
                    if (c == color[0]) g.setStroke(dp(3), TEXT);
                    sw.setBackground(g);
                    sw.setLayoutParams(new ViewGroup.LayoutParams(dp(34), dp(34)));
                    final Runnable self = this;
                    sw.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View vv) {
                            color[0] = c;
                            self.run();
                        }
                    });
                    fl.addView(sw);
                }
            }
        };
        paint.run();
        v.addView(fl, lp(MATCH, WRAP));

        AlertDialog.Builder b = new AlertDialog.Builder(this)
                .setTitle(existing == null ? "Νέα κατηγορία" : "Κατηγορία")
                .setView(scroll(v))
                .setPositiveButton("Αποθήκευση", null)
                .setNegativeButton("Άκυρο", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int w) {
                        showCategories();
                    }
                });
        if (existing != null) b.setNeutralButton("Διαγραφή", null);
        final AlertDialog d = b.create();
        d.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface di) {
                d.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View vv) {
                        String name = n.getText().toString().trim();
                        if (name.isEmpty()) {
                            n.setError("Γράψε όνομα");
                            return;
                        }
                        int ck = rg.getCheckedRadioButtonId() - 100;
                        String kind = ck == 1 ? "IN" : ck == 2 ? "BOTH" : "OUT";
                        if (existing == null) db.addCategory(name, kind, color[0]);
                        else {
                            existing.name = name;
                            existing.kind = kind;
                            existing.color = color[0];
                            db.updateCategory(existing);
                        }
                        d.dismiss();
                        render();
                        showCategories();
                    }
                });
                if (existing != null) {
                    Button del = d.getButton(AlertDialog.BUTTON_NEUTRAL);
                    del.setTextColor(EXP);
                    del.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View vv) {
                            d.dismiss();
                            deleteCategory(existing);
                        }
                    });
                }
            }
        });
        d.show();
    }

    void deleteCategory(final Db.Category k) {
        int n = db.countTx(k.id);
        if (n == 0) {
            new AlertDialog.Builder(this)
                    .setMessage("Να διαγραφεί η κατηγορία «" + k.name + "»;")
                    .setPositiveButton("Διαγραφή", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface d, int w) {
                            db.deleteCategory(k.id, 0);
                            if (filterCat != null && filterCat == k.id) filterCat = null;
                            render();
                            showCategories();
                        }
                    })
                    .setNegativeButton("Άκυρο", null)
                    .show();
            return;
        }
        final List<Db.Category> others = new ArrayList<Db.Category>();
        for (Db.Category c : db.categories()) if (c.id != k.id) others.add(c);
        final String[] items = new String[others.size() + 1];
        for (int i = 0; i < others.size(); i++) items[i] = "Μεταφορά στην «" + others.get(i).name + "»";
        items[others.size()] = "Διαγραφή και των " + n + " κινήσεων";
        new AlertDialog.Builder(this)
                .setTitle("Η «" + k.name + "» έχει " + n + " κινήσεις")
                .setItems(items, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int which) {
                        if (which < others.size()) {
                            db.deleteCategory(k.id, others.get(which).id);
                            if (filterCat != null && filterCat == k.id) filterCat = null;
                            render();
                            toast("Οι κινήσεις μεταφέρθηκαν");
                            showCategories();
                        } else {
                            new AlertDialog.Builder(MainActivity.this)
                                    .setMessage("Σίγουρα; Θα χαθούν οριστικά οι κινήσεις της «" + k.name + "».")
                                    .setPositiveButton("Διαγραφή", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface d2, int w) {
                                            db.deleteCategory(k.id, 0);
                                            if (filterCat != null && filterCat == k.id) filterCat = null;
                                            render();
                                            showCategories();
                                        }
                                    })
                                    .setNegativeButton("Άκυρο", null)
                                    .show();
                        }
                    }
                })
                .setNegativeButton("Άκυρο", null)
                .show();
    }

    // ================================================================= μενού, εξαγωγή, αντίγραφα

    void showMenu(View anchor) {
        PopupMenu pm = new PopupMenu(this, anchor);
        Menu m = pm.getMenu();
        m.add(0, 1, 0, "Κατηγορίες");
        m.add(0, 2, 1, "Εξαγωγή σε Excel (" + year + ")");
        m.add(0, 3, 2, "Αντίγραφο ασφαλείας");
        m.add(0, 4, 3, "Επαναφορά από αντίγραφο");
        m.add(0, 5, 4, "Έλεγχος για ενημέρωση");
        m.add(0, 6, 5, "Σχετικά");
        pm.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
            @Override
            public boolean onMenuItemClick(MenuItem item) {
                switch (item.getItemId()) {
                    case 1: showCategories(); break;
                    case 2: startXlsx(); break;
                    case 3: startBackup(); break;
                    case 4: startRestore(); break;
                    case 5: Updater.check(MainActivity.this, true); break;
                    case 6: about(); break;
                }
                return true;
            }
        });
        pm.show();
    }

    void startXlsx() {
        pendingYear = year;
        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType(XLSX_MIME);
        i.putExtra(Intent.EXTRA_TITLE, "Esoda_Exoda_" + year + ".xlsx");
        launch(i, REQ_XLSX);
    }

    void startBackup() {
        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("application/json");
        i.putExtra(Intent.EXTRA_TITLE, "esoda_exoda_backup_" + new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()) + ".json");
        launch(i, REQ_BACKUP);
    }

    void startRestore() {
        new AlertDialog.Builder(this)
                .setTitle("Επαναφορά από αντίγραφο")
                .setMessage("Διάλεξε ένα αρχείο αντιγράφου (.json). Όλα τα τωρινά δεδομένα της εφαρμογής θα αντικατασταθούν από αυτά του αρχείου.")
                .setPositiveButton("Επιλογή αρχείου", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int w) {
                        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                        i.addCategory(Intent.CATEGORY_OPENABLE);
                        i.setType("*/*");
                        launch(i, REQ_RESTORE);
                    }
                })
                .setNegativeButton("Άκυρο", null)
                .show();
    }

    void launch(Intent i, int req) {
        try {
            startActivityForResult(i, req);
        } catch (Exception e) {
            toast("Δεν βρέθηκε εφαρμογή αρχείων στο κινητό");
        }
    }

    OutputStream openOut(Uri uri) throws Exception {
        try {
            OutputStream os = getContentResolver().openOutputStream(uri, "wt");
            if (os != null) return os;
        } catch (Exception ignored) {
        }
        return getContentResolver().openOutputStream(uri);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (res != RESULT_OK || data == null || data.getData() == null) return;
        final Uri uri = data.getData();
        try {
            if (req == REQ_XLSX) {
                OutputStream os = openOut(uri);
                try {
                    Export.year(db, pendingYear, os);
                } finally {
                    os.close();
                }
                new AlertDialog.Builder(this)
                        .setTitle("Το Excel αποθηκεύτηκε")
                        .setMessage("Περιέχει το φύλλο " + pendingYear + " στη μορφή που είχες (μήνας-μήνας με ΣΥΝΟΛΟ), μια σύνοψη ανά μήνα και όλες τις κινήσεις σε λίστα.")
                        .setPositiveButton("Άνοιγμα", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface d, int w) {
                                Intent v = new Intent(Intent.ACTION_VIEW);
                                v.setDataAndType(uri, XLSX_MIME);
                                v.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                launch(Intent.createChooser(v, "Άνοιγμα με"), 0);
                            }
                        })
                        .setNeutralButton("Κοινοποίηση", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface d, int w) {
                                Intent s = new Intent(Intent.ACTION_SEND);
                                s.setType(XLSX_MIME);
                                s.putExtra(Intent.EXTRA_STREAM, uri);
                                s.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                launch(Intent.createChooser(s, "Αποστολή με"), 0);
                            }
                        })
                        .setNegativeButton("OK", null)
                        .show();
            } else if (req == REQ_BACKUP) {
                OutputStream os = openOut(uri);
                try {
                    os.write(db.exportJson().toString(1).getBytes("UTF-8"));
                } finally {
                    os.close();
                }
                prefs.edit().putLong("last_backup", System.currentTimeMillis()).apply();
                toast("Το αντίγραφο ασφαλείας αποθηκεύτηκε");
                render();
            } else if (req == REQ_RESTORE) {
                InputStream is = getContentResolver().openInputStream(uri);
                String text = readAll(is);
                JSONObject o = new JSONObject(text);
                if (!o.has("transactions") && !o.has("categories")) throw new Exception("Δεν είναι αρχείο αντιγράφου της εφαρμογής");
                int[] n = db.replaceAll(o);
                markData();
                filterCat = null;
                render();
                toast("Επαναφέρθηκαν " + n[0] + " κινήσεις και " + n[1] + " υπόλοιπα");
            }
        } catch (Exception e) {
            new AlertDialog.Builder(this)
                    .setTitle("Κάτι πήγε στραβά")
                    .setMessage(String.valueOf(e.getMessage()))
                    .setPositiveButton("OK", null)
                    .show();
        }
    }

    static String readAll(InputStream is) throws Exception {
        if (is == null) throw new Exception("Δεν ανοίγει το αρχείο");
        try {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = is.read(buf)) > 0) bo.write(buf, 0, n);
            return new String(bo.toByteArray(), "UTF-8");
        } finally {
            is.close();
        }
    }

    void about() {
        long last = prefs.getLong("last_backup", 0);
        String lb = last == 0 ? "ποτέ" : new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.US).format(new Date(last));
        new AlertDialog.Builder(this)
                .setTitle("Έσοδα & Έξοδα")
                .setMessage("Έκδοση " + Updater.myVersionName(this) + "\n\nΟι ενημερώσεις έρχονται αυτόματα από το comfystay.gr/esoda (ή μενού ⋮ → Έλεγχος για ενημέρωση).\n\nΤα δεδομένα μένουν μόνο στο κινητό σου (χωρίς internet, χωρίς λογαριασμό).\n\n"
                        + "Κράτα τακτικά αντίγραφο ασφαλείας (μενού ⋮ → Αντίγραφο ασφαλείας) σε Google Drive ή email, ώστε να μη χαθεί τίποτα αν αλλάξεις κινητό.\n\n"
                        + "Τελευταίο αντίγραφο: " + lb)
                .setPositiveButton("OK", null)
                .show();
    }
}
