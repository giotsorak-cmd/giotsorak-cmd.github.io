package gr.giotsorak.esoda;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

/** Απλό layout που τοποθετεί τα παιδιά σε γραμμές και αναδιπλώνει (για «chips»). */
public class FlowLayout extends ViewGroup {
    private final int hGap, vGap;

    public FlowLayout(Context c, int hGapPx, int vGapPx) {
        super(c);
        hGap = hGapPx;
        vGap = vGapPx;
    }

    @Override
    protected void onMeasure(int widthSpec, int heightSpec) {
        int mode = MeasureSpec.getMode(widthSpec);
        int maxW = mode == MeasureSpec.UNSPECIFIED ? Integer.MAX_VALUE
                : MeasureSpec.getSize(widthSpec) - getPaddingLeft() - getPaddingRight();
        int x = 0, y = 0, lineH = 0, usedW = 0;
        int childSpecW = MeasureSpec.makeMeasureSpec(Math.max(0, maxW == Integer.MAX_VALUE ? 0 : maxW),
                maxW == Integer.MAX_VALUE ? MeasureSpec.UNSPECIFIED : MeasureSpec.AT_MOST);
        int childSpecH = MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);
        for (int i = 0; i < getChildCount(); i++) {
            View ch = getChildAt(i);
            if (ch.getVisibility() == GONE) continue;
            ViewGroup.LayoutParams lp = ch.getLayoutParams();
            int lw = lp == null ? ViewGroup.LayoutParams.WRAP_CONTENT : lp.width;
            int lh = lp == null ? ViewGroup.LayoutParams.WRAP_CONTENT : lp.height;
            if (lw == ViewGroup.LayoutParams.MATCH_PARENT) lw = ViewGroup.LayoutParams.WRAP_CONTENT;
            if (lh == ViewGroup.LayoutParams.MATCH_PARENT) lh = ViewGroup.LayoutParams.WRAP_CONTENT;
            ch.measure(getChildMeasureSpec(childSpecW, 0, lw), getChildMeasureSpec(childSpecH, 0, lh));
            int cw = ch.getMeasuredWidth(), chh = ch.getMeasuredHeight();
            if (x > 0 && x + cw > maxW) {
                x = 0;
                y += lineH + vGap;
                lineH = 0;
            }
            x += cw + hGap;
            usedW = Math.max(usedW, x - hGap);
            lineH = Math.max(lineH, chh);
        }
        int h = y + lineH + getPaddingTop() + getPaddingBottom();
        int w = mode == MeasureSpec.EXACTLY ? MeasureSpec.getSize(widthSpec) : usedW + getPaddingLeft() + getPaddingRight();
        if (mode == MeasureSpec.AT_MOST) w = Math.min(w, MeasureSpec.getSize(widthSpec));
        setMeasuredDimension(w, resolveSize(h, heightSpec));
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int maxW = r - l - getPaddingLeft() - getPaddingRight();
        int x = 0, y = 0, lineH = 0;
        for (int i = 0; i < getChildCount(); i++) {
            View ch = getChildAt(i);
            if (ch.getVisibility() == GONE) continue;
            int cw = ch.getMeasuredWidth(), chh = ch.getMeasuredHeight();
            if (x > 0 && x + cw > maxW) {
                x = 0;
                y += lineH + vGap;
                lineH = 0;
            }
            ch.layout(getPaddingLeft() + x, getPaddingTop() + y, getPaddingLeft() + x + cw, getPaddingTop() + y + chh);
            x += cw + hGap;
            lineH = Math.max(lineH, chh);
        }
    }
}
