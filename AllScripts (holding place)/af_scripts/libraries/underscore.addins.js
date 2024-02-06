/**
 * Created by root on 3/20/17.
 */

_.mixin( {
	guid: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString( 16 );
		} );
	}
} );
_.mixin( {
	generateUUID: function() { // Public Domain/MIT
		var d = new Date().getTime();
		if ( typeof performance !== 'undefined' && typeof performance.now === 'function' ) {
			d += performance.now(); //use high-precision timer if available
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor( d / 16 );
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString( 16 );
		} );
	}
} );
_.mixin( {
	objectToQueryString: function( obj ) {
		var qs = '';
		_.each( obj, function( value, key, list ) {
			qs += key + '=' + value + '&';
		} );
		return qs.slice( 0, qs.length - 1 );
	}
} );
_.mixin( {
	queryStringToObject: function( queryString ) {
		if ( /^([a-zA-Z0-9_.]+=.+(&)?)+$/.test( queryString ) ) {
			var obj = {};
			queryString.split( '&' ).forEach( function( element, index, list ) {
				if ( element.indexOf( '=' ) > -1 ) {
					obj[ element.split( '=' )[ 0 ] ] = element.split( '=' )[ 1 ];
				}
				else {
					obj[ element ] = '';
				}
			} );
			return obj;
		}
		return {
			message: "Query String Parse Failed"
		}
	}
} );
_.mixin( {
	isEmptyString               : function( val ) {
		return val === '';
	}
	, ifNothingReturnEmptyString: function( value ) {
		return value || '';
	}
} );
_.mixin( {
	//this removes items from an array that pass any of set of truth tests
	//the first argument is the array to filter the subsequent arguments
	//are each a seperate predicate that returns true or false
	removeByPredicates : function( array, predicates ) {
		//create standard array out of argument list
		var args = Array.prototype.slice.call( arguments );
		//remove the first argument which is an array of
		// items that will be tested and filtered
		args = _.rest( args );
		return _.filter( array, function( item, index, list ) {
			var test = false;
			//apply each predicate argument as a function
			_.each( args, function( func, index, list ) {
				if ( func( item ) ) test = true;
			} );
			return !test;
		} );

	},
	//this keeps items from an array that pass any of set of truth tests
	//the first argument is the array to filter the subsequent arguments
	//are each a seperate predicate that returns true or false
	includeByPredicates: function( array, predicates ) {
		//create standard array out of argument list
		var args = Array.prototype.slice.call( arguments );
		//remove the first argument which is an array of
		// items that will be tested and filtered
		args = _.rest( args );
		return _.filter( array, function( item, index, list ) {
			var test = false;
			//apply each predicate argument as a function
			_.each( args, function( func, index, list ) {
				if ( func( item ) ) test = true;
			} );
			return test;
		} );

	},
	//simple function to remove blank elements from an array
	removeEmptyElements: function( array ) {
		return _.filter( array, function( item, index, list ) {
			return !(item === undefined || item === null || item === '');
		} );

	}
} );
_.mixin( {
	int             : function( val ) {
		return parseInt( val );
	},
	float           : function( val ) {
		return parseFloat( val );
	},
	//method to clean an array of ints and after int conversion immediately to string
	//this is for the assinine javascript in netsuite that turns everything into a float
	arrayToIntString: function( list ) {
		var compactedList = _.removeByPredicates( list, _.isUndefined, _.isNull, _.isNaN, _.isEmptyString );
		var cleanedList = _.includeByPredicates( compactedList, _.isInteger );
		return _.map( cleanedList, function( element ) {
			return parseInt( element ).toString();
		} );
	},
	//convert values in array to ints
	//also it removes any values that are useless or won't convert
	arrayToInt      : function( list ) {
		var compactedList = _.removeByPredicates( list, _.isUndefined, _.isNull, _.isNaN, _.isEmptyString );
		var cleanedList = _.includeByPredicates( compactedList, _.isInteger );
		return _.map( cleanedList, function( element ) {
			return parseInt( element );
		} );
	},
	//convert values in array to floats
	//also it removes any values that are useless or won;'t convert
	arrayToFloat    : function( list ) {
		var compactedList = _.removeByPredicates( list, _.isUndefined, _.isNull, _.isNaN, _.isEmptyString )
		var cleanedList = _.includeByPredicates( compactedList, _.isFloat );
		return _.map( cleanedList, function( element ) {
			return parseInt( element );
		} );
	}
	, arrayTrim     : function( list ) {
		_.map( list, function( item, index, list ) {
			return _.trim( item );
		} );
	}
	, ensureInt     : function( int ) {
		return int.toString().indexOf( '.' ) > -1 ? int.toString().split( '.' )[ 0 ] : int.toString();
	}
} );

_.mixin( {
	//tales as it first argument the context that you want the statements in
	//then pass a function that executes the required statements
	//and return or not return a value
	functionalizeStatements: function( context, fun ) {
		return fun.call( context );
	}
} );

_.mixin( {
	//method to turn an object of key/values into an array of array of pairs
	//[[key,value],[key,value]]
	objectToPairs: function( obj ) {
		"use strict";
		var output = [];
		var keys = _.keys( obj );
		_.each( keys, function( item, index, list ) {
			output.push( [ item, obj[ item ] ] );
		} );
		return output;
	}
} );
_.mixin( {
	surroundWith: function( str, left, right ) {
		return String.format( '{0}{1}{2}', left, str, right );
	}
} );


_.mixin( {

	deDupeArrayOfObjects: function( list ) {
		var cache = [];
		_.each( list, function( item ) {
			var isMatch = _.some( cache, function( cacheItem ) {
				return _.isMatch( cacheItem, item );
			}, this );
			!isMatch && cache.push( item );
		} );
		return cache;
	}

} );



























