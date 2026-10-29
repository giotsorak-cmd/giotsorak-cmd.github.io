package gr.giotsorak.esoda;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Τοπική βάση SQLite: κατηγορίες, κινήσεις, λογαριασμοί, υπόλοιπα. */
public class Db extends SQLiteOpenHelper {

    public static final int[] PALETTE = {0xFF43A047, 0xFFE53935, 0xFF8E24AA, 0xFFFB8C00, 0xFF1E88E5, 0xFF00897B,
            0xFF6D4C41, 0xFF3949AB, 0xFFC0CA33, 0xFFD81B60, 0xFF546E7A, 0xFF00ACC1, 0xFFF4511E, 0xFF7CB342};

    public static class Category {
        public long id;
        public String name;
        public String kind; // IN, OUT, BOTH
        public int color;
        public int sort;
    }

    public static class Tx {
        public long id;
        public String date;
        public int ym;
        public long catId;
        public String descr;
        public double amount;
        public String note;
    }

    public static class Account {
        public long id;
        public String name;
        public int sort;
        public boolean archived;
    }

    /** Υπόλοιπο λογαριασμού για έναν μήνα (null = δεν έχει γραφτεί). */
    public static class Balance {
        public Double start, end;
    }

    public static class Suggestion {
        public String descr;
        public long catId;
        public boolean income;
        public int count;
    }

    private static Db inst;

    public static synchronized Db get(Context c) {
        if (inst == null) inst = new Db(c.getApplicationContext());
        return inst;
    }

    private Db(Context c) {
        super(c, "esoda.db", null, 2);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'OUT', color INTEGER NOT NULL, sort INTEGER NOT NULL DEFAULT 0)");
        db.execSQL("CREATE TABLE tx (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, ym INTEGER NOT NULL, cat_id INTEGER NOT NULL, descr TEXT NOT NULL DEFAULT '', amount REAL NOT NULL, note TEXT NOT NULL DEFAULT '')");
        db.execSQL("CREATE INDEX tx_ym ON tx(ym)");
        db.execSQL("CREATE TABLE accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0)");
        db.execSQL("CREATE TABLE balances (acc_id INTEGER NOT NULL, ym INTEGER NOT NULL, bstart REAL, bend REAL, PRIMARY KEY(acc_id, ym))");
        createHidden(db);
        String[][] def = {{"ΕΣΟΔΑ", "IN"}, {"ΕΞΟΔΑ", "OUT"}, {"ΔΙΑΣΚΕΔΑΣΗ", "OUT"}, {"ΠΑΙΔΙΑ", "OUT"}, {"ΑΝΝΑΣ", "BOTH"}, {"ΣΙΑΤΙΣΤΑ", "BOTH"}};
        for (int i = 0; i < def.length; i++) insertCategory(db, def[i][0], def[i][1], PALETTE[i % PALETTE.length], i);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldV, int newV) {
        if (oldV < 2) createHidden(db);
    }

    private static void createHidden(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS hidden_accounts (acc_id INTEGER NOT NULL, ym INTEGER NOT NULL, PRIMARY KEY(acc_id, ym))");
    }

    // ---------------------------------------------------------------- categories

    private static long insertCategory(SQLiteDatabase db, String name, String kind, int color, int sort) {
        ContentValues v = new ContentValues();
        v.put("name", name);
        v.put("kind", kind);
        v.put("color", color);
        v.put("sort", sort);
        return db.insert("categories", null, v);
    }

    public List<Category> categories() {
        List<Category> out = new ArrayList<Category>();
        Cursor c = getReadableDatabase().rawQuery("SELECT id,name,kind,color,sort FROM categories ORDER BY sort, id", null);
        try {
            while (c.moveToNext()) {
                Category k = new Category();
                k.id = c.getLong(0);
                k.name = c.getString(1);
                k.kind = c.getString(2);
                k.color = c.getInt(3);
                k.sort = c.getInt(4);
                out.add(k);
            }
        } finally {
            c.close();
        }
        return out;
    }

    public Map<Long, Category> categoryMap() {
        Map<Long, Category> m = new LinkedHashMap<Long, Category>();
        for (Category k : categories()) m.put(k.id, k);
        return m;
    }

    public long addCategory(String name, String kind, int color) {
        int sort = 0;
        for (Category k : categories()) sort = Math.max(sort, k.sort + 1);
        return insertCategory(getWritableDatabase(), name, kind, color, sort);
    }

    public void updateCategory(Category k) {
        ContentValues v = new ContentValues();
        v.put("name", k.name);
        v.put("kind", k.kind);
        v.put("color", k.color);
        getWritableDatabase().update("categories", v, "id=?", new String[]{String.valueOf(k.id)});
    }

    /** Μετακινεί την κατηγορία πάνω (dir=-1) ή κάτω (dir=+1). */
    public void moveCategory(long id, int dir) {
        List<Category> list = categories();
        int i = -1;
        for (int j = 0; j < list.size(); j++) if (list.get(j).id == id) i = j;
        int t = i + dir;
        if (i < 0 || t < 0 || t >= list.size()) return;
        Collections.swap(list, i, t);
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            for (int j = 0; j < list.size(); j++) {
                ContentValues v = new ContentValues();
                v.put("sort", j);
                db.update("categories", v, "id=?", new String[]{String.valueOf(list.get(j).id)});
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    public int countTx(long catId) {
        Cursor c = getReadableDatabase().rawQuery("SELECT COUNT(*) FROM tx WHERE cat_id=?", new String[]{String.valueOf(catId)});
        try {
            return c.moveToFirst() ? c.getInt(0) : 0;
        } finally {
            c.close();
        }
    }

    /** Διαγράφει κατηγορία· αν moveTo>0 μεταφέρει πρώτα τις κινήσεις της εκεί. */
    public void deleteCategory(long id, long moveTo) {
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            if (moveTo > 0) {
                ContentValues v = new ContentValues();
                v.put("cat_id", moveTo);
                db.update("tx", v, "cat_id=?", new String[]{String.valueOf(id)});
            } else {
                db.delete("tx", "cat_id=?", new String[]{String.valueOf(id)});
            }
            db.delete("categories", "id=?", new String[]{String.valueOf(id)});
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    // ---------------------------------------------------------------- transactions

    private static Tx readTx(Cursor c) {
        Tx t = new Tx();
        t.id = c.getLong(0);
        t.date = c.getString(1);
        t.ym = c.getInt(2);
        t.catId = c.getLong(3);
        t.descr = c.getString(4);
        t.amount = c.getDouble(5);
        t.note = c.getString(6);
        return t;
    }

    public List<Tx> txForMonth(int ym) {
        return txQuery("SELECT id,date,ym,cat_id,descr,amount,note FROM tx WHERE ym=? ORDER BY date DESC, id DESC", new String[]{String.valueOf(ym)});
    }

    public List<Tx> txForYear(int year) {
        return txQuery("SELECT id,date,ym,cat_id,descr,amount,note FROM tx WHERE ym BETWEEN ? AND ? ORDER BY date, id",
                new String[]{String.valueOf(year * 100 + 1), String.valueOf(year * 100 + 12)});
    }

    private List<Tx> txQuery(String sql, String[] args) {
        List<Tx> out = new ArrayList<Tx>();
        Cursor c = getReadableDatabase().rawQuery(sql, args);
        try {
            while (c.moveToNext()) out.add(readTx(c));
        } finally {
            c.close();
        }
        return out;
    }

    public void saveTx(Tx t) {
        int[] p = Fmt.splitDate(t.date);
        t.ym = Fmt.ym(p[0], p[1]);
        ContentValues v = new ContentValues();
        v.put("date", t.date);
        v.put("ym", t.ym);
        v.put("cat_id", t.catId);
        v.put("descr", t.descr == null ? "" : t.descr);
        v.put("amount", t.amount);
        v.put("note", t.note == null ? "" : t.note);
        if (t.id > 0) getWritableDatabase().update("tx", v, "id=?", new String[]{String.valueOf(t.id)});
        else t.id = getWritableDatabase().insert("tx", null, v);
    }

    public void deleteTx(long id) {
        getWritableDatabase().delete("tx", "id=?", new String[]{String.valueOf(id)});
    }

    /** Σύνολο ανά κατηγορία για έναν μήνα. */
    public Map<Long, Double> monthTotals(int ym) {
        Map<Long, Double> m = new HashMap<Long, Double>();
        Cursor c = getReadableDatabase().rawQuery("SELECT cat_id, SUM(amount) FROM tx WHERE ym=? GROUP BY cat_id", new String[]{String.valueOf(ym)});
        try {
            while (c.moveToNext()) m.put(c.getLong(0), c.getDouble(1));
        } finally {
            c.close();
        }
        return m;
    }

    /** ym -> (cat_id -> σύνολο) για όλο το έτος. */
    public Map<Integer, Map<Long, Double>> yearMatrix(int year) {
        Map<Integer, Map<Long, Double>> out = new HashMap<Integer, Map<Long, Double>>();
        Cursor c = getReadableDatabase().rawQuery("SELECT ym, cat_id, SUM(amount) FROM tx WHERE ym BETWEEN ? AND ? GROUP BY ym, cat_id",
                new String[]{String.valueOf(year * 100 + 1), String.valueOf(year * 100 + 12)});
        try {
            while (c.moveToNext()) {
                Map<Long, Double> m = out.get(c.getInt(0));
                if (m == null) {
                    m = new HashMap<Long, Double>();
                    out.put(c.getInt(0), m);
                }
                m.put(c.getLong(1), c.getDouble(2));
            }
        } finally {
            c.close();
        }
        return out;
    }

    /** Τα μεγαλύτερα έξοδα του μήνα ανά περιγραφή: [περιγραφή, ποσό]. */
    public List<Object[]> topExpenses(int ym, int limit) {
        List<Object[]> out = new ArrayList<Object[]>();
        Cursor c = getReadableDatabase().rawQuery("SELECT descr, SUM(amount) s, COUNT(*) FROM tx WHERE ym=? AND amount<0 GROUP BY descr ORDER BY s ASC LIMIT " + limit,
                new String[]{String.valueOf(ym)});
        try {
            while (c.moveToNext()) out.add(new Object[]{c.getString(0), c.getDouble(1), c.getInt(2)});
        } finally {
            c.close();
        }
        return out;
    }

    /** Προτάσεις περιγραφών (συχνότερες πρώτα) με την τελευταία κατηγορία που χρησιμοποιήθηκαν. */
    public List<Suggestion> suggestions() {
        LinkedHashMap<String, Suggestion> map = new LinkedHashMap<String, Suggestion>();
        Cursor c = getReadableDatabase().rawQuery("SELECT descr, cat_id, amount FROM tx ORDER BY id DESC", null);
        try {
            while (c.moveToNext()) {
                String d = c.getString(0);
                if (d == null || d.trim().isEmpty()) continue;
                d = d.trim();
                Suggestion s = map.get(d);
                if (s == null) {
                    s = new Suggestion();
                    s.descr = d;
                    s.catId = c.getLong(1);
                    s.income = c.getDouble(2) > 0;
                    map.put(d, s);
                }
                s.count++;
            }
        } finally {
            c.close();
        }
        List<Suggestion> list = new ArrayList<Suggestion>(map.values());
        Collections.sort(list, new Comparator<Suggestion>() {
            @Override
            public int compare(Suggestion a, Suggestion b) {
                return b.count - a.count;
            }
        });
        return list;
    }

    // ---------------------------------------------------------------- accounts & balances

    public List<Account> accounts() {
        List<Account> out = new ArrayList<Account>();
        Cursor c = getReadableDatabase().rawQuery("SELECT id,name,sort,archived FROM accounts ORDER BY sort, id", null);
        try {
            while (c.moveToNext()) {
                Account a = new Account();
                a.id = c.getLong(0);
                a.name = c.getString(1);
                a.sort = c.getInt(2);
                a.archived = c.getInt(3) != 0;
                out.add(a);
            }
        } finally {
            c.close();
        }
        return out;
    }

    public long addAccount(String name) {
        int sort = 0;
        for (Account a : accounts()) sort = Math.max(sort, a.sort + 1);
        ContentValues v = new ContentValues();
        v.put("name", name);
        v.put("sort", sort);
        return getWritableDatabase().insert("accounts", null, v);
    }

    public void renameAccount(long id, String name) {
        ContentValues v = new ContentValues();
        v.put("name", name);
        getWritableDatabase().update("accounts", v, "id=?", new String[]{String.valueOf(id)});
    }

    public void setArchived(long id, boolean archived) {
        ContentValues v = new ContentValues();
        v.put("archived", archived ? 1 : 0);
        getWritableDatabase().update("accounts", v, "id=?", new String[]{String.valueOf(id)});
    }

    public void moveAccount(long id, int dir) {
        List<Account> list = accounts();
        int i = -1;
        for (int j = 0; j < list.size(); j++) if (list.get(j).id == id) i = j;
        int t = i + dir;
        if (i < 0 || t < 0 || t >= list.size()) return;
        Collections.swap(list, i, t);
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            for (int j = 0; j < list.size(); j++) {
                ContentValues v = new ContentValues();
                v.put("sort", j);
                db.update("accounts", v, "id=?", new String[]{String.valueOf(list.get(j).id)});
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    public void deleteAccount(long id) {
        SQLiteDatabase db = getWritableDatabase();
        db.delete("hidden_accounts", "acc_id=?", new String[]{String.valueOf(id)});
        db.delete("balances", "acc_id=?", new String[]{String.valueOf(id)});
        db.delete("accounts", "id=?", new String[]{String.valueOf(id)});
    }

    public Map<Long, Balance> balances(int ym) {
        Map<Long, Balance> m = new HashMap<Long, Balance>();
        Cursor c = getReadableDatabase().rawQuery("SELECT acc_id, bstart, bend FROM balances WHERE ym=?", new String[]{String.valueOf(ym)});
        try {
            while (c.moveToNext()) {
                Balance b = new Balance();
                b.start = c.isNull(1) ? null : c.getDouble(1);
                b.end = c.isNull(2) ? null : c.getDouble(2);
                m.put(c.getLong(0), b);
            }
        } finally {
            c.close();
        }
        return m;
    }

    public void setBalance(long accId, int ym, Double start, Double end) {
        SQLiteDatabase db = getWritableDatabase();
        db.delete("balances", "acc_id=? AND ym=?", new String[]{String.valueOf(accId), String.valueOf(ym)});
        if (start == null && end == null) return;
        ContentValues v = new ContentValues();
        v.put("acc_id", accId);
        v.put("ym", ym);
        if (start == null) v.putNull("bstart");
        else v.put("bstart", start);
        if (end == null) v.putNull("bend");
        else v.put("bend", end);
        db.insert("balances", null, v);
    }

    /** Γράφει ως υπόλοιπο 1ης του μήνα το τελικό του προηγούμενου, όπου λείπει. Επιστρέφει πόσα γράφτηκαν. */
    public int copyPrevEnds(int ym) {
        Map<Long, Balance> prev = balances(Fmt.prevYm(ym));
        Map<Long, Balance> cur = balances(ym);
        java.util.Set<Long> hidden = hiddenAccounts(ym);
        int n = 0;
        SQLiteDatabase db = getWritableDatabase();
        db.beginTransaction();
        try {
            for (Map.Entry<Long, Balance> e : prev.entrySet()) {
                if (e.getValue().end == null || hidden.contains(e.getKey())) continue;
                Balance b = cur.get(e.getKey());
                if (b != null && b.start != null) continue;
                setBalance(e.getKey(), ym, e.getValue().end, b == null ? null : b.end);
                n++;
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
        return n;
    }

    /** Λογαριασμοί που έχουν αφαιρεθεί μόνο από αυτόν τον μήνα. */
    public java.util.Set<Long> hiddenAccounts(int ym) {
        java.util.Set<Long> out = new java.util.HashSet<Long>();
        Cursor c = getReadableDatabase().rawQuery("SELECT acc_id FROM hidden_accounts WHERE ym=?", new String[]{String.valueOf(ym)});
        try {
            while (c.moveToNext()) out.add(c.getLong(0));
        } finally {
            c.close();
        }
        return out;
    }

    /** Αφαιρεί (ή επαναφέρει) λογαριασμό μόνο από έναν μήνα· σβήνει τα υπόλοιπα του μήνα αυτού. */
    public void setHiddenInMonth(long accId, int ym, boolean hidden) {
        SQLiteDatabase db = getWritableDatabase();
        String[] a = {String.valueOf(accId), String.valueOf(ym)};
        if (hidden) {
            db.delete("balances", "acc_id=? AND ym=?", a);
            ContentValues v = new ContentValues();
            v.put("acc_id", accId);
            v.put("ym", ym);
            db.insertWithOnConflict("hidden_accounts", null, v, SQLiteDatabase.CONFLICT_IGNORE);
        } else {
            db.delete("hidden_accounts", "acc_id=? AND ym=?", a);
        }
    }

    /** Αποθηκεύει υπόλοιπα και, αν άλλαξε το τέλος του μήνα, ενημερώνει την 1η του επόμενου
     *  (όταν εκείνη ήταν κενή ή ίση με το παλιό τέλος). */
    public void saveBalance(long accId, int ym, Double start, Double end) {
        Balance old = balances(ym).get(accId);
        Double oldEnd = old == null ? null : old.end;
        setBalance(accId, ym, start, end);
        int y = ym / 100, m = ym % 100;
        int next = m == 12 ? Fmt.ym(y + 1, 1) : Fmt.ym(y, m + 1);
        if (end == null || hiddenAccounts(next).contains(accId)) return;
        if (oldEnd != null && Math.abs(oldEnd - end) < 0.005) return;
        Balance nb = balances(next).get(accId);
        boolean linked = nb == null || nb.start == null || (oldEnd != null && Math.abs(nb.start - oldEnd) < 0.005);
        if (linked && (nb != null || isPastOrCurrent(next))) setBalance(accId, next, end, nb == null ? null : nb.end);
    }

    public static boolean isPastOrCurrent(int ym) {
        java.util.Calendar c = java.util.Calendar.getInstance();
        return ym <= Fmt.ym(c.get(java.util.Calendar.YEAR), c.get(java.util.Calendar.MONTH) + 1);
    }

    /** ym -> {άθροισμα αρχής, άθροισμα τέλους, πλήθος αρχής, πλήθος τέλους} */
    public Map<Integer, double[]> balanceTotals(int year) {
        Map<Integer, double[]> m = new HashMap<Integer, double[]>();
        Cursor c = getReadableDatabase().rawQuery("SELECT ym, SUM(bstart), SUM(bend), COUNT(bstart), COUNT(bend) FROM balances WHERE ym BETWEEN ? AND ? GROUP BY ym",
                new String[]{String.valueOf(year * 100 + 1), String.valueOf(year * 100 + 12)});
        try {
            while (c.moveToNext())
                m.put(c.getInt(0), new double[]{c.getDouble(1), c.getDouble(2), c.getInt(3), c.getInt(4)});
        } finally {
            c.close();
        }
        return m;
    }

    // ---------------------------------------------------------------- backup / import

    public JSONObject exportJson() throws JSONException {
        JSONObject o = new JSONObject();
        o.put("app", "esoda-exoda");
        o.put("version", 1);
        Map<Long, Category> cats = categoryMap();
        JSONArray ca = new JSONArray();
        for (Category k : cats.values()) {
            JSONObject j = new JSONObject();
            j.put("name", k.name);
            j.put("kind", k.kind);
            j.put("color", k.color);
            ca.put(j);
        }
        o.put("categories", ca);
        Map<Long, String> accNames = new HashMap<Long, String>();
        JSONArray aa = new JSONArray();
        for (Account a : accounts()) {
            accNames.put(a.id, a.name);
            JSONObject j = new JSONObject();
            j.put("name", a.name);
            j.put("archived", a.archived);
            aa.put(j);
        }
        o.put("accounts", aa);
        JSONArray ta = new JSONArray();
        for (Tx t : txQuery("SELECT id,date,ym,cat_id,descr,amount,note FROM tx ORDER BY date, id", null)) {
            Category k = cats.get(t.catId);
            JSONObject j = new JSONObject();
            j.put("date", t.date);
            j.put("category", k == null ? "ΧΩΡΙΣ ΚΑΤΗΓΟΡΙΑ" : k.name);
            j.put("description", t.descr);
            j.put("amount", t.amount);
            if (t.note != null && !t.note.isEmpty()) j.put("note", t.note);
            ta.put(j);
        }
        o.put("transactions", ta);
        JSONArray ba = new JSONArray();
        Cursor c = getReadableDatabase().rawQuery("SELECT acc_id, ym, bstart, bend FROM balances ORDER BY ym, acc_id", null);
        try {
            while (c.moveToNext()) {
                String name = accNames.get(c.getLong(0));
                if (name == null) continue;
                JSONObject j = new JSONObject();
                j.put("account", name);
                j.put("ym", c.getInt(1));
                j.put("start", c.isNull(2) ? JSONObject.NULL : (Object) c.getDouble(2));
                j.put("end", c.isNull(3) ? JSONObject.NULL : (Object) c.getDouble(3));
                ba.put(j);
            }
        } finally {
            c.close();
        }
        o.put("balances", ba);
        JSONArray ha = new JSONArray();
        Cursor h = getReadableDatabase().rawQuery("SELECT acc_id, ym FROM hidden_accounts ORDER BY ym", null);
        try {
            while (h.moveToNext()) {
                String name = accNames.get(h.getLong(0));
                if (name == null) continue;
                JSONObject j = new JSONObject();
                j.put("account", name);
                j.put("ym", h.getInt(1));
                ha.put(j);
            }
        } finally {
            h.close();
        }
        o.put("hidden", ha);
        return o;
    }

    /** Αντικαθιστά ΟΛΑ τα δεδομένα με αυτά του JSON (αντίγραφο ασφαλείας ή αρχικά δεδομένα Excel). */
    public int[] replaceAll(JSONObject o) throws JSONException {
        SQLiteDatabase db = getWritableDatabase();
        int nTx = 0, nBal = 0;
        db.beginTransaction();
        try {
            db.delete("tx", null, null);
            db.delete("balances", null, null);
            db.delete("hidden_accounts", null, null);
            db.delete("accounts", null, null);
            db.delete("categories", null, null);
            Map<String, Long> catIds = new HashMap<String, Long>();
            JSONArray ca = o.optJSONArray("categories");
            if (ca != null) for (int i = 0; i < ca.length(); i++) {
                JSONObject j = ca.getJSONObject(i);
                String name = j.getString("name").trim();
                if (catIds.containsKey(name)) continue;
                int color = j.has("color") ? j.getInt("color") : PALETTE[i % PALETTE.length];
                catIds.put(name, insertCategory(db, name, j.optString("kind", "OUT"), color, i));
            }
            Map<String, Long> accIds = new HashMap<String, Long>();
            JSONArray aa = o.optJSONArray("accounts");
            if (aa != null) for (int i = 0; i < aa.length(); i++) {
                Object x = aa.get(i);
                String name;
                boolean archived = false;
                if (x instanceof JSONObject) {
                    name = ((JSONObject) x).getString("name");
                    archived = ((JSONObject) x).optBoolean("archived", false);
                } else name = String.valueOf(x);
                name = name.trim();
                if (accIds.containsKey(name)) continue;
                ContentValues v = new ContentValues();
                v.put("name", name);
                v.put("sort", i);
                v.put("archived", archived ? 1 : 0);
                accIds.put(name, db.insert("accounts", null, v));
            }
            JSONArray ta = o.optJSONArray("transactions");
            if (ta != null) for (int i = 0; i < ta.length(); i++) {
                JSONObject j = ta.getJSONObject(i);
                String cname = j.optString("category", "ΕΞΟΔΑ").trim();
                Long cid = catIds.get(cname);
                if (cid == null) {
                    cid = insertCategory(db, cname, "BOTH", PALETTE[catIds.size() % PALETTE.length], catIds.size());
                    catIds.put(cname, cid);
                }
                String date = j.getString("date");
                int[] p = Fmt.splitDate(date);
                ContentValues v = new ContentValues();
                v.put("date", Fmt.date(p[0], p[1], p[2]));
                v.put("ym", Fmt.ym(p[0], p[1]));
                v.put("cat_id", cid);
                v.put("descr", j.optString("description", "").trim());
                v.put("amount", j.getDouble("amount"));
                v.put("note", j.optString("note", ""));
                db.insert("tx", null, v);
                nTx++;
            }
            JSONArray ba = o.optJSONArray("balances");
            if (ba != null) for (int i = 0; i < ba.length(); i++) {
                JSONObject j = ba.getJSONObject(i);
                String aname = j.getString("account").trim();
                Long aid = accIds.get(aname);
                if (aid == null) {
                    ContentValues v = new ContentValues();
                    v.put("name", aname);
                    v.put("sort", accIds.size());
                    aid = db.insert("accounts", null, v);
                    accIds.put(aname, aid);
                }
                ContentValues v = new ContentValues();
                v.put("acc_id", aid);
                v.put("ym", j.getInt("ym"));
                if (j.isNull("start")) v.putNull("bstart");
                else v.put("bstart", j.getDouble("start"));
                if (j.isNull("end")) v.putNull("bend");
                else v.put("bend", j.getDouble("end"));
                db.insertWithOnConflict("balances", null, v, SQLiteDatabase.CONFLICT_REPLACE);
                nBal++;
            }
            JSONArray ha = o.optJSONArray("hidden");
            if (ha != null) for (int i = 0; i < ha.length(); i++) {
                JSONObject j = ha.getJSONObject(i);
                Long aid = accIds.get(j.getString("account").trim());
                if (aid == null) continue;
                ContentValues v = new ContentValues();
                v.put("acc_id", aid);
                v.put("ym", j.getInt("ym"));
                db.insertWithOnConflict("hidden_accounts", null, v, SQLiteDatabase.CONFLICT_IGNORE);
            }
            if (catIds.isEmpty()) insertCategory(db, "ΕΞΟΔΑ", "OUT", PALETTE[1], 0);
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
        return new int[]{nTx, nBal};
    }
}
