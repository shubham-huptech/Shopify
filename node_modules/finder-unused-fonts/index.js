var FontFinder = /** @class */ (function () {
    function FontFinder() {
        var _this = this;
        this.getProp = function (el, prop) {
            return window.getComputedStyle(el, null).getPropertyValue("font-" + prop);
        };
        var importCss = this.findImport();
        if (importCss.length > 0) {
            importCss.forEach(function (x) { return _this.cors(x); });
            setTimeout(function () { _this.init(); }, 5000);
        }
        else
            this.init();
    }
    FontFinder.prototype.init = function () {
        console.log("§ - FontFinder Use: ", this.findUsing());
        console.log("§ - FontFinder Include: ", this.findInclude());
        console.warn("§  -FontFinder Not Use: ", this.notUse());
    };
    FontFinder.prototype.findUsing = function () {
        var _this = this;
        var useFonts = [];
        document.querySelectorAll("*").forEach(function (x) {
            try {
                var currentFont_1 = {
                    family: _this.getProp(x, "family"),
                    weight: _this.getProp(x, "weight"),
                    style: _this.getProp(x, "style")
                };
                if (useFonts.find(function (f) { return f.family == currentFont_1.family && f.weight == currentFont_1.weight && f.style == currentFont_1.style; }) === undefined)
                    useFonts.push(currentFont_1);
            }
            catch (e) { }
        });
        return useFonts;
    };
    FontFinder.prototype.findImport = function () {
        var importUrl = [];
        var sheet = Array.from(document.styleSheets);
        sheet.forEach(function (x) {
            var rule = Array.from(x.rules || x.cssRules || []);
            rule.forEach(function (y) {
                if (y.constructor.name === 'CSSImportRule')
                    importUrl.push(y.href);
            });
        });
        return importUrl;
    };
    FontFinder.prototype.findInclude = function () {
        var includes = [];
        var sheet = Array.from(document.styleSheets);
        sheet.forEach(function (x) {
            var rule = Array.from(x.rules || x.cssRules || []);
            rule.forEach(function (y) {
                if (y.constructor.name === 'CSSFontFaceRule') {
                    if (includes.find(function (f) { return f.family == y.style.fontFamily && f.weight == y.style.fontWeight && f.style == y.style.fontStyle; }) === undefined)
                        includes.push({ family: y.style.fontFamily, style: y.style.fontStyle || "normal", weight: y.style.fontWeight || "400", src: y.style.src });
                }
            });
        });
        return includes;
    };
    FontFinder.prototype.notUse = function () {
        var _this = this;
        var use = this.findUsing();
        var include = this.findInclude();
        var notUse = [];
        include.forEach(function (x) {
            if (use.find(function (y) {
                return _this.prepare(y.family) == _this.prepare(x.family) &&
                    _this.prepare(y.style) == _this.prepare(x.style) &&
                    _this.prepare(y.weight) == _this.prepare(x.weight);
            }) == undefined)
                notUse.push(x);
        });
        return notUse;
    };
    FontFinder.prototype.prepare = function (str) {
        return str.replace("\"", "").toLowerCase();
    };
    FontFinder.prototype.cors = function (urlCss) {
        var appendCSS = function (css) {
            var s = document.createElement('STYLE');
            s.setAttribute('type', 'text/css');
            if (s.styleSheet) // IE
                s.styleSheet.cssText = css;
            else // the rest of the world
                s.appendChild(document.createTextNode(css));
            document.getElementsByTagName('HEAD')[0].appendChild(s);
        };
        var CORSRequest = function (method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) { // Chrome, Firefox, Opera, Safari
                xhr.open(method, url, true);
            }
            else if (typeof XDomainRequest != "undefined") { // IE
                xhr = new XDomainRequest();
                xhr.open(method, url);
            }
            else { // CORS isn't supported
                xhr = null;
            }
            return xhr;
        };
        var xhr = CORSRequest("GET", urlCss);
        if (!xhr) { // if CORS isn't supported
            alert("Still using Lynx?");
            return;
        }
        xhr.onload = function () {
            var response = xhr.responseText;
            appendCSS(response);
        };
        xhr.onerror = function () {
            alert('Something went wrong!');
        };
        xhr.send();
    };
    return FontFinder;
}());
var prev_handler = window.onload;
window.onload = function () {
    if (prev_handler)
        prev_handler();
    new FontFinder();
};
