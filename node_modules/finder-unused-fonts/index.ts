declare var XDomainRequest;

class FontFinder {

  constructor() {
    let importCss = this.findImport();

    if (importCss.length > 0) {
      importCss.forEach(x => this.cors(x));
      setTimeout(() => { this.init() }, 5000);
    }
    else
      this.init();
  }

  init() {
    console.log("§ - FontFinder Use: ", this.findUsing());
    console.log("§ - FontFinder Include: ", this.findInclude());
    console.warn("§  -FontFinder Not Use: ", this.notUse());
  }

  findUsing() {
    let useFonts: { family: string, weight: string, style: string }[] = [];
    document.querySelectorAll("*").forEach(x => {
      try {
        let currentFont = {
          family: this.getProp(x, "family"),
          weight: this.getProp(x, "weight"),
          style: this.getProp(x, "style")
        };

        if (useFonts.find(f => { return f.family == currentFont.family && f.weight == currentFont.weight && f.style == currentFont.style }) === undefined)
          useFonts.push(currentFont)
      }
      catch (e) { }
    });
    return useFonts;
  }

  getProp = (el: Element, prop: string) => {
    return window.getComputedStyle(el, null).getPropertyValue("font-" + prop);
  }

  findImport() {
    let importUrl: string[] = [];
    let sheet = Array.from(document.styleSheets);
    sheet.forEach(x => {
      let rule: any[] = Array.from((<any>x).rules || (<any>x).cssRules || []);
      rule.forEach(y => {
        if (y.constructor.name === 'CSSImportRule')
          importUrl.push(y.href);
      });
    });
    return importUrl;
  }

  findInclude() {
    let includes: { family: string, style: string, weight: string, src: string }[] = [];
    let sheet = Array.from(document.styleSheets);
    sheet.forEach(x => {
      let rule: any[] = Array.from((<any>x).rules || (<any>x).cssRules || []);
      rule.forEach(y => {
        if (y.constructor.name === 'CSSFontFaceRule') {
          if (includes.find(f => { return f.family == y.style.fontFamily && f.weight == y.style.fontWeight && f.style == y.style.fontStyle }) === undefined)
            includes.push({ family: y.style.fontFamily, style: y.style.fontStyle || "normal", weight: y.style.fontWeight || "400", src: y.style.src });
        }
      });
    });
    return includes;
  }

  notUse() {
    let use = this.findUsing();
    let include = this.findInclude();
    let notUse: { family: string, style: string, weight: string, src: string }[] = [];

    include.forEach(x => {
      if (use.find(y =>
        this.prepare(y.family) == this.prepare(x.family) &&
        this.prepare(y.style) == this.prepare(x.style) &&
        this.prepare(y.weight) == this.prepare(x.weight)) == undefined)
        notUse.push(x);
    });

    return notUse;
  }

  prepare(str: string) {
    return str.replace("\"", "").toLowerCase()
  }

  cors(urlCss: string) {

    var appendCSS = function (css) {
      var s = document.createElement('STYLE');
      s.setAttribute('type', 'text/css');
      if ((<any>s).styleSheet)  // IE
        (<any>s).styleSheet.cssText = css;
      else  // the rest of the world
        s.appendChild(document.createTextNode(css));
      document.getElementsByTagName('HEAD')[0].appendChild(s);
    };

    var CORSRequest = function (method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {  // Chrome, Firefox, Opera, Safari
        xhr.open(method, url, true);
      } else if (typeof XDomainRequest != "undefined") {  // IE
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else { // CORS isn't supported
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
    }
    xhr.onerror = function () {
      alert('Something went wrong!');
    };
    xhr.send();
  }

}

let prev_handler: any = window.onload;

window.onload = () => {
  if (prev_handler)
    prev_handler();
  new FontFinder();
};


