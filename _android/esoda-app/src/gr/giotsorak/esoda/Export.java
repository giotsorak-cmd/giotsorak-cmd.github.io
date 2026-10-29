package gr.giotsorak.esoda;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Εξαγωγή ενός έτους σε .xlsx, στη μορφή του αρχικού Excel (μπλοκ ανά μήνα). */
public final class Export {
    private Export() {}

    public static void year(Db db, int year, OutputStream os) throws IOException {
        List<Db.Category> cats = db.categories();
        List<Db.Account> accs = db.accounts();
        Map<Long, Db.Category> catMap = db.categoryMap();
        List<Db.Tx> all = db.txForYear(year);
        int nc = cats.size();
        int firstCat = 4;                 // στήλη E
        int totalCol = firstCat + nc;     // ΣΥΝΟΛΟ
        int dateCol = totalCol + 1, noteCol = totalCol + 2;

        Xlsx x = new Xlsx();
        Xlsx.Sheet s = x.sheet(String.valueOf(year)).freezeHeader();
        s.width(0, 15).width(1, 30).width(2, 10).width(3, 10).width(dateCol, 12).width(noteCol, 24);
        for (int i = 0; i < nc; i++) s.width(firstCat + i, 13);
        s.width(totalCol, 12);
        s.str(0, 0, "ΜΗΝΑΣ", Xlsx.HEADER);
        s.str(0, 1, "ΠΕΡΙΓΡΑΦΗ", Xlsx.HEADER);
        s.str(0, 2, "1η", Xlsx.HEADER);
        s.str(0, 3, "ΤΕΛΟΣ", Xlsx.HEADER);
        for (int i = 0; i < nc; i++) s.str(0, firstCat + i, cats.get(i).name, Xlsx.HEADER);
        s.str(0, totalCol, "ΣΥΝΟΛΟ", Xlsx.HEADER);
        s.str(0, dateCol, "ΗΜΕΡΟΜΗΝΙΑ", Xlsx.HEADER);
        s.str(0, noteCol, "ΣΗΜΕΙΩΣΗ", Xlsx.HEADER);

        Xlsx.Sheet sum = x.sheet("Σύνοψη " + year).freezeHeader();
        sum.width(0, 15);
        sum.str(0, 0, "ΜΗΝΑΣ", Xlsx.HEADER);
        for (int i = 0; i < nc; i++) {
            sum.str(0, 1 + i, cats.get(i).name, Xlsx.HEADER);
            sum.width(1 + i, 13);
        }
        sum.str(0, 1 + nc, "ΣΥΝΟΛΟ", Xlsx.HEADER);
        sum.str(0, 2 + nc, "ΛΟΓ/ΣΜΟΙ 1η", Xlsx.HEADER);
        sum.str(0, 3 + nc, "ΛΟΓ/ΣΜΟΙ ΤΕΛΟΣ", Xlsx.HEADER);
        sum.width(1 + nc, 12).width(2 + nc, 15).width(3 + nc, 16);
        int sumRow = 1;

        Map<Integer, Map<Long, Double>> matrix = db.yearMatrix(year);
        Map<Integer, double[]> balTot = db.balanceTotals(year);

        int r = 1;
        for (int m = 1; m <= 12; m++) {
            int ym = Fmt.ym(year, m);
            List<Db.Tx> txs = new ArrayList<Db.Tx>();
            for (Db.Tx t : all) if (t.ym == ym) txs.add(t);
            Map<Long, Db.Balance> bal = db.balances(ym);
            if (txs.isEmpty() && bal.isEmpty()) continue;
            int first = r;
            s.str(r, 0, Fmt.MONTHS_CAPS[m - 1], Xlsx.MONTH);
            for (Db.Account a : accs) {
                Db.Balance b = bal.get(a.id);
                if (b == null) continue;
                s.str(r, 1, a.name, Xlsx.NORMAL);
                if (b.start != null) s.num(r, 2, b.start, Xlsx.NUM);
                if (b.end != null) s.num(r, 3, b.end, Xlsx.NUM);
                r++;
            }
            for (Db.Tx t : txs) {
                int ci = -1;
                for (int i = 0; i < nc; i++) if (cats.get(i).id == t.catId) ci = i;
                Db.Category k = catMap.get(t.catId);
                String d = t.descr == null || t.descr.isEmpty() ? (k == null ? "" : k.name) : t.descr;
                s.str(r, 1, d, Xlsx.NORMAL);
                if (ci >= 0) s.num(r, firstCat + ci, t.amount, Xlsx.NUM);
                int[] p = Fmt.splitDate(t.date);
                s.num(r, dateCol, Xlsx.serial(p[0], p[1], p[2]), Xlsx.DATE);
                if (t.note != null && !t.note.isEmpty()) s.str(r, noteCol, t.note, Xlsx.NORMAL);
                r++;
            }
            if (r == first) r++;
            int last = r - 1;
            s.str(r, 0, "ΣΥΝΟΛΟ", Xlsx.TOTAL);
            s.str(r, 1, "", Xlsx.TOTAL);
            for (int c = 2; c < totalCol; c++)
                s.formula(r, c, "SUM(" + Xlsx.ref(first, c) + ":" + Xlsx.ref(last, c) + ")", Xlsx.TOTAL_NUM);
            if (nc > 0)
                s.formula(r, totalCol, "SUM(" + Xlsx.ref(r, firstCat) + ":" + Xlsx.ref(r, totalCol - 1) + ")", Xlsx.TOTAL_NUM);
            r += 2;

            // σύνοψη
            Map<Long, Double> mt = matrix.get(ym);
            sum.str(sumRow, 0, Fmt.MONTHS_CAPS[m - 1], Xlsx.BOLD);
            for (int i = 0; i < nc; i++) {
                Double v = mt == null ? null : mt.get(cats.get(i).id);
                sum.num(sumRow, 1 + i, v == null ? 0 : Math.round(v * 100) / 100.0, Xlsx.NUM);
            }
            if (nc > 0)
                sum.formula(sumRow, 1 + nc, "SUM(" + Xlsx.ref(sumRow, 1) + ":" + Xlsx.ref(sumRow, nc) + ")", Xlsx.BOLD_NUM);
            double[] bt = balTot.get(ym);
            if (bt != null && bt[2] > 0) sum.num(sumRow, 2 + nc, bt[0], Xlsx.NUM);
            if (bt != null && bt[3] > 0) sum.num(sumRow, 3 + nc, bt[1], Xlsx.NUM);
            sumRow++;
        }
        if (sumRow > 1) {
            sum.str(sumRow, 0, "ΣΥΝΟΛΟ ΕΤΟΥΣ", Xlsx.TOTAL);
            for (int c = 1; c <= 1 + nc; c++)
                sum.formula(sumRow, c, "SUM(" + Xlsx.ref(1, c) + ":" + Xlsx.ref(sumRow - 1, c) + ")", Xlsx.TOTAL_NUM);
        }

        Xlsx.Sheet flat = x.sheet("Κινήσεις " + year).freezeHeader();
        flat.width(0, 12).width(1, 16).width(2, 30).width(3, 11).width(4, 30);
        String[] h = {"ΗΜΕΡΟΜΗΝΙΑ", "ΚΑΤΗΓΟΡΙΑ", "ΠΕΡΙΓΡΑΦΗ", "ΠΟΣΟ", "ΣΗΜΕΙΩΣΗ"};
        for (int i = 0; i < h.length; i++) flat.str(0, i, h[i], Xlsx.HEADER);
        int fr = 1;
        for (Db.Tx t : all) {
            int[] p = Fmt.splitDate(t.date);
            Db.Category k = catMap.get(t.catId);
            flat.num(fr, 0, Xlsx.serial(p[0], p[1], p[2]), Xlsx.DATE);
            flat.str(fr, 1, k == null ? "" : k.name, Xlsx.NORMAL);
            flat.str(fr, 2, t.descr, Xlsx.NORMAL);
            flat.num(fr, 3, t.amount, Xlsx.NUM);
            if (t.note != null && !t.note.isEmpty()) flat.str(fr, 4, t.note, Xlsx.NORMAL);
            fr++;
        }
        x.write(os);
    }
}
