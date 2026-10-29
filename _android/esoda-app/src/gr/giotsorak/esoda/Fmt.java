package gr.giotsorak.esoda;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Calendar;

/** Μορφοποίηση ποσών και ημερομηνιών στα ελληνικά. */
public final class Fmt {
    private Fmt() {}

    public static final String[] MONTHS = {"Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
            "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"};
    public static final String[] MONTHS_GEN = {"Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
            "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"};
    public static final String[] MONTHS_SHORT = {"Ιαν", "Φεβ", "Μαρ", "Απρ", "Μάι", "Ιουν",
            "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"};
    public static final String[] MONTHS_CAPS = {"ΙΑΝΟΥΑΡΙΟΣ", "ΦΕΒΡΟΥΑΡΙΟΣ", "ΜΑΡΤΙΟΣ", "ΑΠΡΙΛΙΟΣ", "ΜΑΙΟΣ", "ΙΟΥΝΙΟΣ",
            "ΙΟΥΛΙΟΣ", "ΑΥΓΟΥΣΤΟΣ", "ΣΕΠΤΕΜΒΡΙΟΣ", "ΟΚΤΩΒΡΙΟΣ", "ΝΟΕΜΒΡΙΟΣ", "ΔΕΚΕΜΒΡΙΟΣ"};
    private static final String[] DAYS = {"Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"};

    private static DecimalFormat whole, dec;

    private static synchronized void init() {
        if (whole != null) return;
        DecimalFormatSymbols s = new DecimalFormatSymbols();
        s.setGroupingSeparator('.');
        s.setDecimalSeparator(',');
        s.setMinusSign('-');
        whole = new DecimalFormat("#,##0", s);
        dec = new DecimalFormat("#,##0.00", s);
    }

    /** π.χ. 1.234 € ή -7,50 € */
    public static String money(double v) {
        return num(v) + " €";
    }

    public static String num(double v) {
        init();
        if (Math.abs(v) < 0.005) return "0";
        if (Math.abs(v - Math.rint(v)) < 0.005) return whole.format(Math.rint(v));
        return dec.format(v);
    }

    /** Με πρόσημο: +1.234 € / −50 € */
    public static String signed(double v) {
        if (Math.abs(v) < 0.005) return "0 €";
        return (v > 0 ? "+" : "−") + num(Math.abs(v)) + " €";
    }

    /** Αριθμός για πεδίο επεξεργασίας (χωρίς διαχωριστικό χιλιάδων). */
    public static String plain(double v) {
        if (Math.abs(v - Math.rint(v)) < 0.005) return String.valueOf((long) Math.rint(v));
        return String.format(java.util.Locale.US, "%.2f", v).replace('.', ',');
    }

    /** Διαβάζει "1.234,50", "1234.5", "-50", "50,5". Επιστρέφει null αν δεν είναι αριθμός. */
    public static Double parse(String s) {
        if (s == null) return null;
        s = s.trim().replace(" ", "").replace("€", "").replace("−", "-");
        if (s.isEmpty()) return null;
        int lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.');
        if (lastComma >= 0 && lastDot >= 0) {
            if (lastComma > lastDot) s = s.replace(".", "").replace(',', '.');
            else s = s.replace(",", "");
        } else if (lastComma >= 0) {
            s = s.replace(',', '.');
        } else if (lastDot >= 0 && s.indexOf('.') != lastDot) {
            s = s.replace(".", ""); // 1.234.567
        }
        try {
            double d = Double.parseDouble(s);
            if (Double.isNaN(d) || Double.isInfinite(d)) return null;
            return d;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static String monthTitle(int year, int month) {
        return MONTHS[month - 1] + " " + year;
    }

    public static String date(int y, int m, int d) {
        return String.format(java.util.Locale.US, "%04d-%02d-%02d", y, m, d);
    }

    public static int[] splitDate(String date) {
        try {
            String[] p = date.split("-");
            return new int[]{Integer.parseInt(p[0]), Integer.parseInt(p[1]), Integer.parseInt(p[2])};
        } catch (Exception e) {
            Calendar c = Calendar.getInstance();
            return new int[]{c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH)};
        }
    }

    /** π.χ. "Πέμπτη 1 Οκτωβρίου 2026" */
    public static String longDate(String date, boolean withYear) {
        int[] p = splitDate(date);
        Calendar c = Calendar.getInstance();
        c.clear();
        c.set(p[0], p[1] - 1, p[2]);
        String s = DAYS[c.get(Calendar.DAY_OF_WEEK) - 1] + " " + p[2] + " " + MONTHS_GEN[p[1] - 1];
        return withYear ? s + " " + p[0] : s;
    }

    public static int ym(int y, int m) {
        return y * 100 + m;
    }

    public static int prevYm(int ym) {
        int y = ym / 100, m = ym % 100;
        return m == 1 ? ym(y - 1, 12) : ym(y, m - 1);
    }
}
