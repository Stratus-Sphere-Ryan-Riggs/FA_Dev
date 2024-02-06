_.mixin( {
	/**
	 * @param obj
	 * @returns new object with only the properties that have values
	 */
	NSMappedObjectTruthyValues: function( obj ) {
		obj = obj || {};
		var result = {};
		_.each( obj, function( value, key, oldObj ) {
			obj[ key ] && _.functionalizeStatements( this, function() {
				result[ key ] = value;
			} );
		} );
		return result;
	}
} );

_.mixin( {

	//get standard record value
	NSGetRecordValue           : function( currentRecord, id ) {
		return currentRecord.getValue( {
			fieldId: id
		} );
	}
	, NSGetRecordText          : function( currentRecord, id ) {
		return currentRecord.getText( {
			fieldId: id
		} );
	}
	//set standard record value
	, NSSetRecordValue         : function( currentRecord, id, value ) {
		return currentRecord.setValue( {
			fieldId: id
			, value: value
		} );
	}
	//get value from a search result field
	, NSGetResultValue         : function( resultObject, name, join, summary ) {
		var options = {};
		options.name = name;
		join && _.functionalizeStatements( this, function() {
			options.join = join;
		} );
		summary && _.functionalizeStatements( this, function() {
			options.summary = summary;
		} );
		return resultObject.getValue( options );
	}
	, NSGetResultText          : function( resultObject, name, join, summary ) {
		var options = {};
		options.name = name;
		join && _.functionalizeStatements( this, function() {
			options.join = join;
		} );
		summary && _.functionalizeStatements( this, function() {
			options.summary = summary;
		} );

		return resultObject.getText( options );
	}
	//get sublist value from a standard record
	, NSGetSublistValue        : function( currentRecord, sublistId, fieldId, line ) {
		return currentRecord.getSublistValue( {
			sublistId: sublistId
			, fieldId: fieldId
			, line   : line
		} );
	}
	//load record by id
	, NSLoadRecord             : function( recordModule, type, id ) {
		return recordModule.load( {
			id    : parseInt( id )
			, type: type
		} );
	}
	, NSRecordMapFieldsToObject: function( rec, type ) {
		var obj = {};
		obj[ 'id' ] = parseInt( rec.id || _.NSGetRecordValue( rec, 'internalid' ) ).toString();
		obj[ 'recordType' ] = type || '';
		var cols = rec.getFields();

		_.each( cols, function( col, index, list ) {
			obj[ col ] = _.NSGetRecordValue( rec, col );
			obj[ col + 'Text' ] = _.NSGetRecordText( rec, col );
		} )
		return obj;
	}
	, NSGetLineItemCount       : function( currentRecord, sublistId ) {
		return currentRecord.getLineCount( {
			sublistId: sublistId
		} );
	}
	//create deferred search object
	, NSSearchCreate           : function( searchModule, type, savedSearch, columns, filters ) {
		var options = {};
		options[ 'type' ] = type;
		options[ 'columns' ] = columns;
		options[ 'filters' ] = filters;
		if ( savedSearch ) {
			options[ 'savedSearch' ] = savedSearch
		}
		return searchModule.create( options );
	}
	//create, run and iterate the cursor
	, NSSearchObjectRun        : function( searchObject ) {
		var searchRecords = [];
		searchObject.run().each( function( item ) {
			searchRecords.push( item );
			return true;
		} );
		return searchRecords;
	}
	//create, run and iterate the cursor, transform result object into a flat object of properties
	, NSSearchObjectRunMapped  : function( searchObject, onlyTruthValues, noTextValues ) {
		var searchRecords = [];
		searchObject.run().each( function( item ) {
			searchRecords.push( item );
			return true;
		} );

		var mapped = _.map( searchRecords, function( item, index, list ) {
			var obj = {};
			obj[ 'id' ] = item.id || _.NSGetResultValue( item, 'internalid' );
			obj[ 'recordType' ] = item.recordType;
			var cols = item.columns;
			_.each( cols, function( value, key, object ) {
				obj[ value.name ] = _.NSGetResultValue( item, value.name );
				!!!noTextValues && _.functionalizeStatements(this, function(  ) {
					obj[ value.name + 'Text' ] = _.NSGetResultText( item, value.name );
				} );
			} )
			return obj;
		} );

		onlyTruthValues && _.functionalizeStatements( this, function() {
			mapped = _.map( mapped, function( item, index, list ) {
				return _.NSMappedObjectTruthyValues( item );
			} );
		} );

		return mapped;
	}

	//create a search column sort is optional
	, NSSearchCreateColumn: function( searchModule, name, sort, join, summary ) {
		var options = {};
		options[ 'name' ] = name;
		if ( sort ) {
			options.sort = sort;
		}
		if ( join ) {
			options.join = join;
		}
		if ( summary ) {
			options.summary = summary;
		}
		return searchModule.createColumn( options );
	}
	, NSRecordSave        : function( currentRecord, enableSourcing, ignoreMandatoryFields ) {
		//set rational defaults
		enableSourcing = enableSourcing || false;
		ignoreMandatoryFields = ignoreMandatoryFields || true;
		return currentRecord.save( {
			enableSourcing       : enableSourcing,
			ignoreMandatoryFields: ignoreMandatoryFields
		} );
	}
	, NSLogDebug          : function( logModule, title, details ) {
		logModule.debug( {
			title    : title
			, details: details
		} );
	}
	//render statement, returns file to be attached to the email send
	//entity id is the customer id
	//printMode is from the render.printMode.PDF enum for a PDF
	//formId is the id of the statement form to use
	//startdate is the oldest transaction to appear on the statement
	//statementDate
	//openTransactionsOnly
	//the only ones required are entityid, printMode, statementDate, nulls maybe substotuted for the missing arguments
	, NSRenderStatement   : function( renderModule, entityId, printMode, formId, startDate, statementDate, openTransactionsOnly ) {
		openTransactionsOnly = !!openTransactionsOnly;
		var options = {};
		options.entityId = entityId;
		options.printMode = printMode;
		options.statementDate = statementDate;
		formId && _.functionalizeStatements( this, function() {
			options.formId = formId;
		} );
		startDate && _.functionalizeStatements( this, function() {
			options.startDate = startDate;
		} );
		openTransactionsOnly && _.functionalizeStatements( this, function() {
			options.openTransactionsOnly = openTransactionsOnly;
		} );
		return renderModule.statement( options );
	}
	//senderId author
	//recipients can be a entityid or email address or an array of entity ids or email addresses
	//replyTo email
	//subject
	//body
	//cc handled the same as recipients or be null, ONE OR THE OTHER
	//bcc handled the same as recipients or be null, ONE OR THE OTHER
	//attachments are an array of file objects, even if there is only 1 EXAMPLE [fileObj]
	, NSSendEmail         : function( emailModule, senderId, recipients, replyTo, subject, body, cc, bcc, relatedRecords, attachments ) {
		var options = {};
		options.author = senderId;
		options.recipients = recipients;
		options.replyTo = replyTo;
		options.subject = subject;
		options.body = body;
		cc && _.functionalizeStatements( this, function() {
			options.cc = cc;
		} );
		bcc && _.functionalizeStatements( this, function() {
			options.bcc = bcc;
		} );
		relatedRecords && _.functionalizeStatements( this, function() {
			options.relatedRecords = relatedRecords;
		} );
		attachments && _.functionalizeStatements( this, function() {
			options.attachments = attachments;
		} );

		return emailModule.send( options );
	}

	, NSRenderTransaction: function( renderModule, entityId, printMode ) {
		return renderModule.transaction( {
			entityId : entityId,
			printMode: printMode
		} );
	}
	, NSPost             : function( httpModule, https, url, headers, body ) {
		if ( https ) {
			return httpModule.post( {
				url      : url
				, body   : body
				, headers: headers
			} );
		}
		else {
			return httpModule.post( {
				url      : url
				, body   : body
				, headers: headers
			} );
		}
	}
	, NSGet              : function( httpModule, https, url, headers, body ) {
		if ( https ) {
			return httpModule.get( {
				url      : url
				, body   : body
				, headers: headers
			} );
		}
		else {
			return httpModule.get( {
				url      : url
				, body   : body
				, headers: headers
			} );
		}
	}
	, NSReadFile         : function( fileModule, fileId ) {
		return fileModule.load( {
			id: fileId
		} );
	}
} );

_.mixin( {
	NSResultSet: function( searchModule, idColumn, type, savedSearch, columns, filters ) {
		var searchResults = [];
		var lastId = 0;
		var searchRecords = [];
		var searchRecordsLength = 0;
		do {
			//clone filters into a new array
			var addFilter = [];
			_.each( filters, function( element, index, list ) {
				addFilter.push( element );
			} );
			if ( addFilter.length > 0 ) {
				addFilter.push( 'and' );
			}
			//add the iterator filter to the filters array
			var idFilterExpression = [ idColumn, 'greaterthan', lastId ];
			//addFilter.push( 'and' );
			addFilter.push( idFilterExpression );


			try {
				//var searchObject = _.NSSearchCreate( searchModule, type, savedSearch, columns, addFilter );

				var savedSearch = '';
				var options = {};
				options[ 'type' ] = type;
				options[ 'columns' ] = columns;
				options[ 'filters' ] = addFilter;
				if ( savedSearch ) {
					options[ 'savedSearch' ] = savedSearch
				}
				var searchObject = searchModule.create( options );


				//var searchObject = _.NSSearchCreate( searchModule, type, savedSearch, addColumn, addFilter );
				//searchRecords = _.NSSearchObjectRun( searchObject );

				var searchRecords = [];
				searchObject.run().each( function( item ) {
					searchRecords.push( item );
					return true;
				} );


				var foo = this;
			}
			catch ( e ) {
				//!production && _.NSLogDebug( "Catch around search object execution", e.message );
			}
			if ( searchRecords && searchRecords.length ) {
				searchRecordsLength = searchRecords.length;
				lastId = searchRecords[ searchRecords.length - 1 ].getValue( idColumn );
				searchResults = searchResults.concat( searchRecords );
			} else {
				searchRecordsLength = 0;
			}
		}
		while ( searchRecordsLength == 4000 );

		return searchResults;
	}
} )

_.mixin( {
	NSCreateForm              : function( uiModule, title ) {
		return uiModule.createForm( {
			title: title
		} );
	}
	, NSAddField              : function( formModule, id, type, label, source, container ) {
		var options = {};
		options.id = id;
		options.type = type;
		options.label = label;
		source && _.functionalizeStatements( this, function() {
			options.source = source;
		} );
		container && _.functionalizeStatements( this, function() {
			options.container = container;
		} );
		return formModule.addField( options );
	}
	, NSUpdateFieldDisplaySize: function( field, height, width ) {
		var options = {
			height : height
			, width: width
		};
		field.updateDisplaySize( options );
	}
	, NSAddSubmitButton       : function( formModule, label ) {
		return formModule.addSubmitButton( {
			label: label
		} );
	}
	, NSAddButton             : function( formModule, id, label, funcName ) {
		var options = {};
		options.id = id;
		options.label = label;
		funcName && _.functionalizeStatements( this, function() {
			options.funcName = funcName;
		} );
		return formModule.addButton( options );
	}
	, NSFieldDisplaySize      : function( field, width, height ) {
		return field.displaySize = {
			width   : width
			, height: height
		};
	}
	, NSAddFieldGroup         : function( formModule, id, label ) {
		return formModule.addFieldGroup( {
			id     : id
			, label: label
		} );
	}
	, NSAddSelectOption       : function( selectObj, value, text, isSelected ) {
		return selectObj.addSelectOption( {
			value       : value
			, text      : text
			, isSelected: isSelected
		} );
	}

} );
_.mixin( {
	NSLoadSelect: function( selectObj, addPleaseChoose, pleaseChooseComment, searchObject, value, text ) {
		if ( addPleaseChoose ) {
			pleaseChooseComment = pleaseChooseComment || '              ';
			_.NSAddSelectOption( selectObj, '0', pleaseChooseComment, true );
		}
		value = value || 'id';
		searchObject.run().each.call( this, function( item ) {
			var recordValue = value === 'id' ? item.id : _.NSGetResultValue( item, value, null, null );
			var recordText = _.NSGetResultValue( item, text, null, null );
			_.NSAddSelectOption( selectObj, recordValue, recordText, false );
			return true;
		} );
	}

} );













