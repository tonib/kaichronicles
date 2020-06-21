
/****************** STRING ******************/

if (typeof String.prototype.endsWith !== "function") {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if (typeof String.prototype.startsWith !== "function") {
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) === 0;
  };
}

if (typeof String.prototype.padLeft !== "function") {
    String.prototype.padLeft = function(padLength, padChar) {
        let result = this;
        while (result.length < padLength) {
            result = padChar + result;
        }
        return result;
    };
}

if (typeof String.prototype.escapeRegExp !== "function") {
  String.prototype.escapeRegExp = function() {
      return this.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  };
}

if (typeof String.prototype.replaceAll !== "function") {
  String.prototype.replaceAll = function(find, replace) {
      return this.replace( new RegExp( find.escapeRegExp(), "g"), replace );
  };
}

if (typeof String.prototype.unescapeHtml !== "function") {
  /**
   * Unescape HTML entities (ex. "&gt;" return ">" )
   * @return The unescaped version of the string
   */
  String.prototype.unescapeHtml = function() {
      return $("<span>").html(this).text();
  };
}

if (typeof String.prototype.getUrlParameter !== "function") {

  /**
   * Get a parameter value of a URL parameters.
   * The string must to be a parameters string (ex. "a=1&b=2")
   * @param sParam The parameter name to get (String)
   * @return The parameter value (string). null if it was not found
   */
  String.prototype.getUrlParameter = function(sParam) {

    const sPageURL = decodeURIComponent(this);
    const sURLVariables = sPageURL.split("&");

    for (const sURLVariable of sURLVariables) {
      const sParameterName = sURLVariable.split("=");

      if (sParameterName[0] === sParam) {
        const value = sParameterName[1];
        if ( value === undefined ) {
          return null;
        } else {
          return decodeURIComponent(sParameterName[1]).replace(/\+/g, " ");
        }
      }
    }

  };

}

if (typeof String.prototype.isValidFileName !== "function") {

  /**
   * Return true if it's a valid file name
   */
  String.prototype.isValidFileName = function() {
    return /^[a-z0-9_.\-() '"]+$/i.test(this);
  };

}

/****************** ARRAY ******************/

if (typeof Array.prototype.contains !== "function") {
  Array.prototype.contains = function(value) {
      return $.inArray(value, this) >= 0;
  };
}

if (typeof Array.prototype.removeValue !== "function") {
  Array.prototype.removeValue = function(value) {
      const index = $.inArray(value, this);
      if ( index >= 0 ) {
        this.splice(index, 1);
        return true;
      } else {
        return false;
      }
  };
}

if (!Array.prototype.some) {
  Array.prototype.some = function(fun) {
    for (const that of this) {
      if ( fun.call( that ) ) {
        return true;
      }
    }
    return false;
  };
}

if (!Array.prototype.clone) {
    Array.prototype.clone = function() {
      return this.slice(0);
    };
}

if (!Array.prototype.deepClone) {
  Array.prototype.deepClone = function() {
    const copy = [];
    for (const element of this) {
      copy.push( element.clone ? element.clone() : element );
    }
    return copy;
  };
}

/****************** WINDOW ******************/

if (typeof Window.prototype.getUrlParameter !== "function") {

  /**
   * Get a parameter value of the current URL
   * @param sParam The parameter name to get (String)
   * @return The parameter value (string). null if it was not found
   */
  Window.prototype.getUrlParameter = (sParam) => {
    return window.location.search.substring(1).getUrlParameter(sParam);
  };

}

/****************** AJAX UTILS ******************/

/**
 * Get a human readable error for an AJAX error
 * @param {Object} context The "this" value for the error callback (oh javascript...)
 * @param {jqXHR} jqXHR The AJAX call itself
 * @param {String} textStatus Possible values for the second argument (besides null) are
 * "timeout", "error", "abort", and "parsererror"
 * @param {String} errorThrown The textual portion of the HTTP status, such as "Not Found"
 * or "Internal Server Error."
 * @returns {String} The error message for an AJAX error
 */
function ajaxErrorMsg(context, jqXHR, textStatus, errorThrown) {
  if ( !errorThrown ) {
      errorThrown = "Unknown error (Cross domain error?)";
  }
  if ( !textStatus ) {
    textStatus = "";
  }
  const msg = context.url + " failed: " + errorThrown.toString() + ". Code: " + jqXHR.status +
    ". Status: " + textStatus /*+ '. Response text: ' + jqXHR.responseText*/;
  return msg;
}

/**
 * Get a rejected promise for an AJAX error
 * @param {Object} context The "this" value for the error callback (oh javascript...)
 * @param {jqXHR} jqXHR The AJAX call itself
 * @param {String} textStatus Possible values for the second argument (besides null) are
 * "timeout", "error", "abort", and "parsererror"
 * @param {String} errorThrown The textual portion of the HTTP status, such as "Not Found"
 * or "Internal Server Error."
 * @returns {Promise} The rejected promise
 */
function ajaxErrorPromise(context, jqXHR, textStatus, errorThrown) {
  const dfd = jQuery.Deferred();
  dfd.reject( ajaxErrorMsg(context, jqXHR, textStatus, errorThrown) );
  return dfd.promise();
}
