_TMP['c1'] = '/Content/SVGSamples/', _TMP['c2'] = '//static.omnisoftsystems.com/Scripts/1.0.0/oss.canvg.min.js';
$LDR.script(window._TMP.c2).wait(function () {
    "use strict";
    $(function () {
        var r = "undefined",
            t = "fast",
            o = "disabled",
            f = "checked",
            pt = "preserveAspectRatio",
            nt = "width",
            tt = "height",
            it = "viewBox",
            s = "change",
            h = "click",
            rt = "main",
            c = "#txtAreaOSSCanvas2DContext",
            a = "#txtAreaSVGInput",
            v = "#frmCanvg",
            wt = "#frmJSResult",
            l = "#errMsg",
            e, i, n, ut, y, p, w, ft, et = OSS.supports.svg(),
            ot = window._TMP.c1,
            b, k;
        n = $("#canvasCanvgResult");
        ut = $("#canvasJSResult");
        typeof window.FlashCanvas == r && (b = function () {
            var i = navigator.userAgent.toLowerCase(),
                n = i.indexOf("android 4."),
                t, r = !1;
            return n > -1 && (n += 10, t = i.substr(n, 1), r = t == "1" || t == "2"), r
        }, b() && (k = $("canvas").parents().filter(function () {
            var n = $(this),
                t = n.css("overflow"),
                i = n.css("overflow-x"),
                r = n.css("overflow-y");
            return t == "hidden" || t == "scroll" || i == "hidden" || i == "scroll" || r == "hidden" || r == "scroll" ? !0 : !1
        }), k.length > 0 && k.css("overflow", "visible")), b = null);
        OSS.evts.resizer.init(function () {
            $("#canvasgrp1,#canvasgrp2").each(function () {
                var n, t, i = $(this);
                t = i.width();
                n = i.height();
                $(this).find("canvas[data-role='overlay']").each(function () {
                    $(this).removeAttr("style").attr({
                        width: t,
                        height: n
                    })
                })
            });
            $("#btnOptsSave").click()
        }, 500);
        $(window).on("load", function () {
            OSS.utils.cleanStartup()
        }).on("unload", function () {
            i.destroy();
            n.ossCanvg("destroy");
            OSS.evts.resizer.destroy();
            $(OSS.evts.custom.eMain).off();
            OSS.evts.custom.eMain = null;
            ot = e = i = null;
            $("canvas").attr({
                width: 0
            })
        });
        OSS.evts.custom = {
            eMain: {}
        };
        $(OSS.evts.custom.eMain).on(rt, function (n, t) {
            vt(t.svgXML, t.svgName)
        });
        i = n.ossCanvg({
            onError: function (n) {
                setTimeout(function () {
                    var t = "ossCanvg:SVG Parse Error:" + n.name + "\nError:" + n.message;
                    alert(t);
                    u()
                }, 50)
            },
            canvg: {
                onDrawComplete: function () {
                    var t = "",
                        r = i.getLog(0),
                        u, f, e;
                    r.cnt && (t += "<div id='txtAreaUSProps' class='inline'>" + r.txt.replace(/\n/g, "<br/>") + "<\/div>", r.txt = "");
                    $("#ctrAreaUSProps").html("<h5>UnResolved Objects: " + r.cnt + "<\/h5>" + t);
                    r = null;
                    OSS.evts.resizer.resize(500);
                    p = (new Date).getTime();
                    w = p - ft;
                    at("Elapsed(ms): " + w);
                    p = w = null;
                    t = "'use strict';\n";
                    g && (u = n[0].svg, f = i.CtxName(), e = f + ".canvas.width=" + u.ViewPort.width() + ";\n" + f + ".canvas.height=" + u.ViewPort.height() + ";", typeof window.FlashCanvas != "undefined" && (e = "/* " + e + " */"), t += e, u = f = null);
                    t += i.getLog();
                    $(c).val(t);
                    t = "";
                    n.removeAttr("style");
                    ti.click();
                    n.ossCanvg("reset", "")
                }
            }
        }).ossCanvg("getOSS2DCTX");
        e = ut[0];
        var d = !1,
            g = !0,
            u = function (n) {
                n && n.length ? (d = !0, $("#loadmsg").html(n), $("body").addClass("modal"), $("#ctrload").show()) : (d = !1, $("body").removeClass("modal"), $("#ctrload").hide())
            }, st = function (n, t, i) {
                n.width = 0;
                n.width = t;
                n.height = i
            }, bt = function (n, t, i) {
                var f = n.canvas,
                    e, o, u;
                for (typeof window.FlashCanvas == r ? (e = f.clientHeight, o = f.clientWidth) : (e = f.height, o = f.width), st(f, o, e), n.lineWidth = .35, n.strokeStyle = i, u = 0; u <= e; u += t) n.beginPath(), n.moveTo(0, u), n.lineTo(o, u), n.closePath(), n.stroke();
                for (u = 0; u <= o; u += t) n.beginPath(), n.moveTo(u, 0), n.lineTo(u, e), n.closePath(), n.stroke();
                f = null
            }, ht = function (n, i) {
                var u = n.parent(),
                    r = n[0],
                    o = r.getContext("2d"),
                    f, e;
                e = u.width();
                f = u.height();
                st(r, e, f);
                kt(i, n, r);
                n.show(t);
                at();
                o = r = u = null
            }, kt = function (n, t, i) {
                var r = i.id + ": Styled[H=" + t.height() + "px W=" + t.width() + "px] Logical[H=" + i.height + "px W=" + i.width + "px]";
                $("div.oss-form-footer .oss-left:first", n).html(r)
            }, dt = function () {
                for (var n = i.getCntrs(), t = n.length; t--;) y.eq(t).text(n[t]);
                n.length = 0
            }, ct = function () {
                i.clearLogs();
                y.text("0")
            }, gt = function () {
                for (var u = i.getCntrs(!0), a = u.length, e, s, h, l, c = $("#tbodyStats"), o = c.clone(0)[0], r = document.createElement("tr"), n, t, f = 0; f < a; f++)
                    for (s = u[f], h = s.names, l = h.length, n = r.cloneNode(0), n.setAttribute("class", "group ui-state-default"), t = n.insertCell(0), t.setAttribute("colspan", "2"), t.innerHTML = s.title, o.appendChild(n), n = r.cloneNode(0), t = n.insertCell(0), t.setAttribute("class", "oss-group ui-widget-content"), t.innerHTML = "0", t = n.insertCell(1), t.setAttribute("class", "ui-widget-content"), r = n, e = 0; e < l; e++) n = r.cloneNode(!0), n.childNodes[1].innerHTML = h[e], o.appendChild(n);
                u.length = 0;
                c.append(o.childNodes);
                y = c.find("tr:not(.group)").hover(function () {
                    $("td", this).addClass("ui-state-hover")
                }, function () {
                    $("td", this).removeClass("ui-state-hover")
                }).find("td:first-child");
                o = r = n = t = u = null
            }, lt = function () {
                if ($(a).val(""), $(c).val(""), et) {
                    var t = $("#radio2");
                    t.prop(f) || t.prop(f, !0).trigger(s);
                    t = null;
                    $("#cntrSVG").empty()
                }
                ht(n, v);
                ht($(e), wt);
                ct();
                $(l).hide();
                yt(!0)
            }, at = function (n) {
                $("div.ui-widget-header span.oss-right", v).html(n)
            }, vt = function (i, f) {
                var o, e, h, v, s = $(a);
                ft = (new Date).getTime();
                typeof i == "string" ? s.val(i) : i = $.trim(s.val());
                try {
                    o = $($.parseXML(i));
                    e = o.find("svg:first");
                    e.length && (e.removeAttr("onload"), g && (i = typeof XMLSerializer != r ? {
                        xmlns: "http://www.w3.org/2000/svg",
                        version: "1.1"
                    } : {}, h = e.attr(nt), v = e.attr(tt), typeof h == r && (i[nt] = n.width()), typeof v == r && (i[tt] = n.height()), typeof e.attr(it) == r && (i[it] = "0 0 " + h + " " + v), i[pt] = "xMidYMid meet", e.attr(i)), o.find("script").remove(), i = typeof XMLSerializer != r ? (new XMLSerializer).serializeToString(o[0]) : o[0].xml, s.val(i))
                } catch (y) {
                    i = "";
                    $(l).html("<p class='error'>Oops! Found svg errors<\/p><br/><br/>Name:" + y.name + "<br/>Msg:" + y.message).show(t)
                } finally {
                    s = e = null
                }
                $(c).val("");
                i.length ? (u("Processing"), n.ossCanvg("build", {
                    xml: o[0],
                    fnId: f || ""
                })) : u();
                o = null
            }, yt = function (t) {
                var e, r = 0,
                    u, o, s, f, i;
                if (t || (e = n[0].svg, e && (u = e.Images, r = u.length)), o = $("#ctrImgs").html("<h5>Image References: " + r + "<\/h5>"), r) {
                    for (f = [], i = 0; i < r; i++) s = u[i].img.src, f.push("<img src='", s, "' height='42' width='42' title='", i, "- ", s, "'/>");
                    o.append(f.join(""));
                    f.length = 0;
                    u = null
                }
                o = null
            }, ni = function () {
                var i, r, u = n[0].svg,
                    f = $(c).val();
                $(e).removeAttr("style");
                try {
                    return r = e.getContext("2d"), i = new Function("ctx,_svg", f), i(r, u), !0
                } catch (o) {
                    $(e).hide(t);
                    $(l).html("<p class='error'>Oops! Found canvas errors<\/p><br/><br/>Name:" + o.name + "<br/>Msg:" + o.message).show(t)
                } finally {
                    u = f = r = i = null
                }
            }, ti = $("#btnRender").removeAttr(o).on(h, function (i) {
                return i.preventDefault(), u("Rendering"), yt(), $(l).hide(t), n.show(t), ni() && dt(), u(), !1
            });
        if (et) $("div.ui-widget-header span[data-role='title']", v).html("<input type='radio' name='grpSVG' value='svg' id='radio1' /><label for='radio1'>SVG<\/label><input type='radio' name='grpSVG' value='canvas' id='radio2' checked='checked' /><label for='radio2'>Canvg: Translated SVG to Canvas<\/label>").find("input:radio[name='grpSVG']").on(s, function () {
            var n = $("#ctrsvg"),
                i = $("#ctrcanvg");
            $(this).val() == "canvas" ? (n.hide(t).html(""), i.show(t)) : (i.hide(t), n.html($(a).val()).show(t));
            n = i = null
        });
        $("#btnClear").on(h, lt).removeAttr(o);
        $("#btnGenerate").on(h, function () {
            ct();
            vt()
        }).removeAttr(o);
        $("#selSVGSample").on(s, function (n) {
            if (d) {
                n.preventDefault();
                return
            }
            u("Loading");
            var t = $(":selected", this).text();
            lt();
            $.ajax({
                type: "GET",
                url: ot + this.value + ".xml",
                dataType: "text"
            }).done(function (n) {
                $(OSS.evts.custom.eMain).trigger(rt, {
                    svgXML: n,
                    svgName: t
                })
            }).fail(function () {
                u()
            })
        }).removeAttr(o);
        $("#optsdfts").on(s, function () {
            g = $(this).prop(f)
        });
        gt();
        $("#btnOptsSave").on(h, function () {
            var n = $("#canvasGridLines,#canvasGridLines2"),
                t;
            $("#optsGrd").prop(f) && (t = $("#optsGrdClr").val(), n.each(function () {
                bt(this.getContext("2d"), 10, t)
            }), n.show());
            n = null;
            i.options({
                roundup: $("#roundup").val(),
                verbose: $("#optsVerbose").prop(f),
                analyze: $("#optsAnalyze").prop(f)
            });
            $("#selSVGSample").trigger(s)
        }).removeAttr(o).trigger(h)
    })
});