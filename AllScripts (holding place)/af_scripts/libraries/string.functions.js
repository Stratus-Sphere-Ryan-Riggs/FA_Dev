/**
 * Created by root on 3/20/17.
 */
//string methods
//assign empty string
String.empty = '';
String.Empty = '';
//remove first n characters
String.prototype.removeFirst = function( howmany ) {
	var str = this;
	var l = this.length;
	howmany = howmany > l ? l : howmany;
	str = str.substring( howmany, l );
	return str;
};
//remove last n characters
String.prototype.removeLast = function( howmany ) {
	var str = this;
	var l = this.length;
	howmany = howmany > l ? l : howmany;
	howmany = l - howmany;
	str = str.substring( 0, howmany );
	return str;
};
//bool ends with
String.prototype.endsWith = function( s ) {
	var pattern = new RegExp( "\w*" + s + "$", "i" );
	if ( pattern.test( this ) ) {
		return true;
	}
	else {
		return false;
	}
};
//bool starts with
String.prototype.startsWith = function( s ) {
	var pattern = new RegExp( '^' + s + '\w*', 'i' );
	if ( pattern.test( this ) ) {
		return true;
	}
	else {
		return false;
	}
};
//replace all occurrences of excepts string and regex
String.prototype.replaceAll = function( pattern, replacement ) {
	var str = this;
	while ( str.indexOf( pattern ) > -1 ) {
		str = str.replace( pattern, replacement );
	}
	return str;
};
if ( !String.prototype.concat ) {
	String.prototype.concat = function( string ) {
		var str = this;
		for ( var i = 0; i < arguments.length; i++ ) {
			str += arguments[ i ].toString();
		}
		return str;
	}
}

if (!String.concat) {
	/**
	 * @param comma seperated list of args to concatenate
	 */
	String.concat = function(args) {
		var str = new String();
		for ( var i = 0; i < arguments.length; i++ ) {
			str += arguments[ i ].toString();
		}
		return str;
	}
}

//works like .NET string.format
String.format = function( str ) {
	var length = arguments.length;
	var target = new String();
	target = arguments[ 0 ];
	for ( var i = 1; i < length; i++ ) {
		var j = i - 1;
		var val = new RegExp( "{" + j + "\\}", 'g' );
		target = target.replace( val, arguments[ i ].toString() );
	}
	return target;
};


if ( !Array.prototype.reduce ) {
	Object.defineProperty( Array.prototype, 'reduce', {
		value: function( callback /*, initialValue*/ ) {
			if ( this === null ) {
				throw new TypeError( 'Array.prototype.reduce ' +
					'called on null or undefined' );
			}
			if ( typeof callback !== 'function' ) {
				throw new TypeError( callback +
					' is not a function' );
			}

			// 1. Let O be ? ToObject(this value).
			var o = Object( this );

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// Steps 3, 4, 5, 6, 7
			var k = 0;
			var value;

			if ( arguments.length >= 2 ) {
				value = arguments[ 1 ];
			} else {
				while ( k < len && !(k in o) ) {
					k++;
				}

				// 3. If len is 0 and initialValue is not present,
				//    throw a TypeError exception.
				if ( k >= len ) {
					throw new TypeError( 'Reduce of empty array ' +
						'with no initial value' );
				}
				value = o[ k++ ];
			}

			// 8. Repeat, while k < len
			while ( k < len ) {
				// a. Let Pk be ! ToString(k).
				// b. Let kPresent be ? HasProperty(O, Pk).
				// c. If kPresent is true, then
				//    i.  Let kValue be ? Get(O, Pk).
				//    ii. Let accumulator be ? Call(
				//          callbackfn, undefined,
				//          « accumulator, kValue, k, O »).
				if ( k in o ) {
					value = callback( value, o[ k ], k, o );
				}

				// d. Increase k by 1.
				k++;
			}

			// 9. Return accumulator.
			return value;
		}
	} );
}
if ( !Array.isArray ) {
	Array.isArray = function( arg ) {
		return Object.prototype.toString.call( arg ) === '[object Array]';
	};
}

if ( !String.prototype.trim ) {
	String.prototype.trim = function() {
		return this.replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '' );
	};
}

