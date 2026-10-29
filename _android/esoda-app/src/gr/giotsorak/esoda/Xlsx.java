package gr.giotsorak.esoda;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/** Ελάχιστος συγγραφέας αρχείων .xlsx (χωρίς εξωτερικές βιβλιοθήκες). */
public class Xlsx {
    public static final int NORMAL = 0, BOLD = 1, NUM = 2, BOLD_NUM = 3, HEADER = 4, MONTH = 5, DATE = 6, TOTAL_NUM = 7, TOTAL = 8;

    public static class Sheet {
        final String name;
        final TreeMap<Integer, TreeMap<Integer, String>> rows = new TreeMap<Integer, TreeMap<Integer, String>>();
        final TreeMap<Integer, Double> widths = new TreeMap<Integer, Double>();
        boolean freezeTop;

        Sheet(String name) {
            this.name = name;
        }

        public Sheet width(int col, double w) {
            widths.put(col, w);
            return this;
        }

        public Sheet freezeHeader() {
            freezeTop = true;
            return this;
        }

        private void put(int r, int c, String xml) {
            TreeMap<Integer, String> row = rows.get(r);
            if (row == null) {
                row = new TreeMap<Integer, String>();
                rows.put(r, row);
            }
            row.put(c, xml);
        }

        /** r, c μετρούν από 0. */
        public void str(int r, int c, String text, int style) {
            if (text == null) text = "";
            put(r, c, "<c r=\"" + ref(r, c) + "\" s=\"" + style + "\" t=\"inlineStr\"><is><t xml:space=\"preserve\">" + esc(text) + "</t></is></c>");
        }

        public void num(int r, int c, double v, int style) {
            put(r, c, "<c r=\"" + ref(r, c) + "\" s=\"" + style + "\"><v>" + numStr(v) + "</v></c>");
        }

        public void formula(int r, int c, String f, int style) {
            put(r, c, "<c r=\"" + ref(r, c) + "\" s=\"" + style + "\"><f>" + esc(f) + "</f></c>");
        }
    }

    private final List<Sheet> sheets = new ArrayList<Sheet>();

    public Sheet sheet(String name) {
        String n = name.replaceAll("[\\\\/?*\\[\\]:]", "-");
        if (n.length() > 31) n = n.substring(0, 31);
        Sheet s = new Sheet(n);
        sheets.add(s);
        return s;
    }

    public static String col(int c) {
        StringBuilder sb = new StringBuilder();
        c++;
        while (c > 0) {
            int m = (c - 1) % 26;
            sb.insert(0, (char) ('A' + m));
            c = (c - 1) / 26;
        }
        return sb.toString();
    }

    public static String ref(int r, int c) {
        return col(c) + (r + 1);
    }

    static String numStr(double v) {
        if (Math.abs(v - Math.rint(v)) < 1e-9 && Math.abs(v) < 1e15) return String.valueOf((long) Math.rint(v));
        String s = String.valueOf(v);
        return s.replace(',', '.');
    }

    static String esc(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 8);
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '&': sb.append("&amp;"); break;
                case '<': sb.append("&lt;"); break;
                case '>': sb.append("&gt;"); break;
                case '"': sb.append("&quot;"); break;
                default:
                    if (ch < 0x20 && ch != '\t' && ch != '\n' && ch != '\r') sb.append(' ');
                    else sb.append(ch);
            }
        }
        return sb.toString();
    }

    /** Excel serial date από yyyy-MM-dd. */
    public static double serial(int y, int m, int d) {
        // ημέρες από 1970-01-01 (αλγόριθμος civil-from-days, ανεξάρτητος ζώνης ώρας)
        int yy = m <= 2 ? y - 1 : y;
        int era = (yy >= 0 ? yy : yy - 399) / 400;
        int yoe = yy - era * 400;
        int mp = (m + 9) % 12;
        int doy = (153 * mp + 2) / 5 + d - 1;
        int doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
        long days = (long) era * 146097 + doe - 719468;
        return days + 25569;
    }

    public void write(OutputStream os) throws IOException {
        ZipOutputStream z = new ZipOutputStream(os);
        StringBuilder ct = new StringBuilder();
        ct.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>")
                .append("<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">")
                .append("<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>")
                .append("<Default Extension=\"xml\" ContentType=\"application/xml\"/>")
                .append("<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>")
                .append("<Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/>");
        for (int i = 0; i < sheets.size(); i++)
            ct.append("<Override PartName=\"/xl/worksheets/sheet").append(i + 1).append(".xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>");
        ct.append("</Types>");
        entry(z, "[Content_Types].xml", ct.toString());

        entry(z, "_rels/.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>"
                + "</Relationships>");

        StringBuilder wb = new StringBuilder();
        wb.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>")
                .append("<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"><sheets>");
        StringBuilder rels = new StringBuilder();
        rels.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>")
                .append("<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">");
        for (int i = 0; i < sheets.size(); i++) {
            wb.append("<sheet name=\"").append(esc(sheets.get(i).name)).append("\" sheetId=\"").append(i + 1).append("\" r:id=\"rId").append(i + 1).append("\"/>");
            rels.append("<Relationship Id=\"rId").append(i + 1).append("\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet").append(i + 1).append(".xml\"/>");
        }
        wb.append("</sheets><calcPr calcId=\"191029\" fullCalcOnLoad=\"1\"/></workbook>");
        rels.append("<Relationship Id=\"rId").append(sheets.size() + 1).append("\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>");
        rels.append("</Relationships>");
        entry(z, "xl/workbook.xml", wb.toString());
        entry(z, "xl/_rels/workbook.xml.rels", rels.toString());

        entry(z, "xl/styles.xml", "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
                + "<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
                                + "<fonts count=\"3\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font><font><b/><sz val=\"11\"/><name val=\"Calibri\"/></font>"
                + "<font><b/><sz val=\"11\"/><color rgb=\"FFFFFFFF\"/><name val=\"Calibri\"/></font></fonts>"
                + "<fills count=\"5\"><fill><patternFill patternType=\"none\"/></fill><fill><patternFill patternType=\"gray125\"/></fill>"
                + "<fill><patternFill patternType=\"solid\"><fgColor rgb=\"FF1F4E5F\"/><bgColor indexed=\"64\"/></patternFill></fill>"
                + "<fill><patternFill patternType=\"solid\"><fgColor rgb=\"FFDDEBF0\"/><bgColor indexed=\"64\"/></patternFill></fill>"
                + "<fill><patternFill patternType=\"solid\"><fgColor rgb=\"FFFFF2CC\"/><bgColor indexed=\"64\"/></patternFill></fill></fills>"
                + "<borders count=\"2\"><border><left/><right/><top/><bottom/><diagonal/></border>"
                + "<border><left/><right/><top style=\"thin\"><color auto=\"1\"/></top><bottom/><diagonal/></border></borders>"
                + "<cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs>"
                + "<cellXfs count=\"9\">"
                + "<xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/>"                                  // 0 NORMAL
                + "<xf numFmtId=\"0\" fontId=\"1\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyFont=\"1\"/>"                  // 1 BOLD
                + "<xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyNumberFormat=\"1\"/>"        // 2 NUM
                + "<xf numFmtId=\"0\" fontId=\"1\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyNumberFormat=\"1\" applyFont=\"1\"/>" // 3 BOLD_NUM
                + "<xf numFmtId=\"0\" fontId=\"2\" fillId=\"2\" borderId=\"0\" xfId=\"0\" applyFont=\"1\" applyFill=\"1\"/>"  // 4 HEADER
                + "<xf numFmtId=\"0\" fontId=\"1\" fillId=\"3\" borderId=\"0\" xfId=\"0\" applyFont=\"1\" applyFill=\"1\"/>"  // 5 MONTH
                + "<xf numFmtId=\"14\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyNumberFormat=\"1\"/>"         // 6 DATE
                + "<xf numFmtId=\"0\" fontId=\"1\" fillId=\"4\" borderId=\"1\" xfId=\"0\" applyNumberFormat=\"1\" applyFont=\"1\" applyFill=\"1\" applyBorder=\"1\"/>" // 7 TOTAL_NUM
                + "<xf numFmtId=\"0\" fontId=\"1\" fillId=\"4\" borderId=\"1\" xfId=\"0\" applyFont=\"1\" applyFill=\"1\" applyBorder=\"1\"/>" // 8 TOTAL
                + "</cellXfs>"
                + "<cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles>"
                + "</styleSheet>");

        for (int i = 0; i < sheets.size(); i++) {
            Sheet s = sheets.get(i);
            StringBuilder sb = new StringBuilder();
            sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>")
                    .append("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">");
            if (s.freezeTop)
                sb.append("<sheetViews><sheetView workbookViewId=\"0\"><pane ySplit=\"1\" topLeftCell=\"A2\" activePane=\"bottomLeft\" state=\"frozen\"/></sheetView></sheetViews>");
            if (!s.widths.isEmpty()) {
                sb.append("<cols>");
                for (Map.Entry<Integer, Double> e : s.widths.entrySet())
                    sb.append("<col min=\"").append(e.getKey() + 1).append("\" max=\"").append(e.getKey() + 1)
                            .append("\" width=\"").append(numStr(e.getValue())).append("\" customWidth=\"1\"/>");
                sb.append("</cols>");
            }
            sb.append("<sheetData>");
            for (Map.Entry<Integer, TreeMap<Integer, String>> row : s.rows.entrySet()) {
                sb.append("<row r=\"").append(row.getKey() + 1).append("\">");
                for (String c : row.getValue().values()) sb.append(c);
                sb.append("</row>");
            }
            sb.append("</sheetData></worksheet>");
            entry(z, "xl/worksheets/sheet" + (i + 1) + ".xml", sb.toString());
        }
        z.finish();
        z.flush();
    }

    private static void entry(ZipOutputStream z, String name, String content) throws IOException {
        z.putNextEntry(new ZipEntry(name));
        z.write(content.getBytes(Charset.forName("UTF-8")));
        z.closeEntry();
    }
}
