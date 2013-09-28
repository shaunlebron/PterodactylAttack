OSS.evts.resizer = function (n) {
    "use strict";
    var i, u = 0,
        f = 0,
        e = !1,
        o = "resize",
        t = null,
        r = null,
        s;
    return {
        init: function (u) {
            i = this;
            $("html:first").hasClass("lt-ie8") ? (t = $("body:first"), e = !0) : t = $(n);
            r = u;
            s = n.parent.resizeIFrame;
            t.on(o, function () {
                i.resizeTO && clearTimeout(i.resizeTO);
                i.resizeTO = setTimeout(function () {
                    $(this).trigger("resizeEnd")
                }, 500)
            }).on("resizeEnd", i.resize)
        },
        resize: function (n, h, c) {
            t && (isNaN(n) && (n = 50), setTimeout(function () {
                var n = t.innerWidth();
                h = h || t.innerHeight();
                e && r && t.off(o, i.resize);
                try {
                    (u !== n || f !== h || c) && (u = n, f = h, typeof r == "function" && r.call(this, u, f), typeof s != "undefined" && s($("body").outerHeight(!0)))
                } catch (l) {}
                if (e && r) t.on(o, i.resize);
                i.resizeTO = 0
            }, n))
        },
        destroy: function () {
            t && t.off(o, i.resize);
            r = t = i = s = null
        }
    }
}(window);