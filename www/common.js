
/****************** STRING ******************/

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

if (typeof String.prototype.padLeft !== 'function') {
    String.prototype.padLeft = function (padLength, padChar) {
        var result = this;
        while(result.length < padLength)
            result = padChar + result;
        return result;
    };
}

if (typeof String.prototype.escapeRegExp !== 'function') {
  String.prototype.escapeRegExp = function() {
      return this.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  };
}

if (typeof String.prototype.replaceAll !== 'function') {
  String.prototype.replaceAll = function(find, replace) {
      return this.replace( new RegExp( find.escapeRegExp(), 'g'), replace );
  };
}

if (typeof String.prototype.unescapeHtml !== 'function') {
  /**
   * Unescape HTML entities (ex. "&gt;" return ">" )
   * @return The unescaped version of the string
   */
  String.prototype.unescapeHtml = function() {
      return $('<span>').html(this).text();
  };
}

if (typeof String.prototype.getUrlParameter !== 'function') {

  /**
   * Get a parameter value of a URL parameters. 
   * The string must to be a parameters string (ex. "a=1&b=2")
   * @param sParam The parameter name to get (String)
   * @return The parameter value (string). null if it was not found
   */
  String.prototype.getUrlParameter = function (sParam) {

    var sPageURL = decodeURIComponent(this),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        var value = sParameterName[1];
        if( value === undefined )
          return null;
        else
          return decodeURIComponent(sParameterName[1]).replace(/\+/g, ' ');
      }
    }

  };

}

/****************** ARRAY ******************/

if (typeof Array.prototype.contains !== 'function') {
  Array.prototype.contains = function(value) {
      return $.inArray(value, this) >= 0;
  };
}

if (typeof Array.prototype.removeValue !== 'function') {
  Array.prototype.removeValue = function(value) {
      var index = $.inArray(value, this);
      if( index >= 0 ) {
        this.splice(index, 1);
        return true;
      }
      else
        return false;
  };
}

if (!Array.prototype.some) {
  Array.prototype.some = function(fun) {
    for (var i = 0; i < this.length; i++) {
      if ( fun.call( this[i] ) )
        return true;
    }
    return false;
  };
}

/****************** WINDOW ******************/

if (typeof Window.prototype.getUrlParameter !== 'function') {

  /**
   * Get a parameter value of the current URL
   * @param sParam The parameter name to get (String)
   * @return The parameter value (string). null if it was not found
   */
  Window.prototype.getUrlParameter = function (sParam) {
    /*
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        var value = sParameterName[1];
        if( value === undefined )
          return null;
        else
          return decodeURIComponent(sParameterName[1]).replace(/\+/g, ' ');
      }
    }
    */
    return window.location.search.substring(1).getUrlParameter(sParam);
  };

}
