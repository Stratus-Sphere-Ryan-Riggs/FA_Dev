/**
 * Load the xml module to validate, parse, read, and modify XML documents.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43692
 */
declare interface N_xml {

    NodeType: {
        ATTRIBUTE_NODE;
        CDATA_SECTION_NODE;
        COMMENT_NODE;
        DOCUMENT_FRAGMENT_NODE;
        DOCUMENT_NODE;
        DOCUMENT_TYPE_NODE;
        ELEMENT_NODE;
        ENTITY_NODE;
        ENTITY_REFERENCE_NODE;
        NOTATION_NODE;
        PROCESSING_INSTRUCTION_NODE;
        TEXT_NODE;
    }

    /**
    * Prepares a string for use in XML by escaping XML markup, such as angle brackets, quotation marks, and ampersands.
    * @Supported All script types
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44134
    */
    escape(options: {
        /** (Required) String being escaped. */
        xmlText: string
    }): string

    /**
   * Validates an XML document against an XML Schema (XSD).This method only validates XML Schema (XSD); validation of other XML schema languages is not supported.The XML document must be passed as an xml.Document object. The location of the source XML Document does not matter; the validation is performed with the Document object stored in memory. The XSD must be stored in the File Cabinet.
   * @Supported All server-side script types
   * @Governance None
   * @Since Version 2015 Release 2
   * @Throws SSS_XML_DOES_​NOT_​CONFORM_​TO_​SCHEMA > The provided XML is invalid for the provided schema.
   * @Throws SSS_INVALID_​XML_​SCHEMA_​OR_​DEPENDENCY > Schema is an incorrectly structured XSD or the dependent schema cannot be found.
   * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43700
   */
    validate(options: {
        /** (Required) The xml.Document object to validate. */
        xml: N_xml.document
        /** (Required) The file ID or path to the XSD in the File Cabinet to validate the XML document against. */
        xsdFilePathOrId: number | string
        /** (Optional) The folder ID or path to a folder in the File Cabinet containing additional XSD schemas which are imported by the parent XSD. */
        importFolderPathOrId: number | string
    }): void

}

declare namespace N_xml {
    interface Parser {
        /**
        * Parses a String into a W3C XML document object. This API is useful if you want to navigate/query a structured XML document more effectively using either the Document API or NetSuite built-in XPath functions.You can also use this method to validate your XML. If you pass a malformed string in as the options.text argument, Parser.fromString returns an SSS_XML_DOM_EXCEPTION error.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > The input XML string is malformed.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43694
        */
        fromString(options: {
            /** (Required) String being converted to an xml.Document. */
            text: string
        }): N_xml.Document

        /**
        * Converts (serializes) an xml.Document object into a string. This API is useful, for example, if you want to serialize and store an xml.Document in a custom field.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43695
        */
        toString(options: {
            /** (Required) XML document being serialized. */
            document: N_xml.document
        }): string
    }

    interface XPath {
        /**
        * Selects an array of nodes from an XML that match an XPath expression.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43697
        */
        select(options: {
            /** (Required) XML node being queried. */
            node: N_xml.node
            /** (Required) XPath expression used to query node. */
            xpath: string
        }): N_xml.Node[]



    }

    interface Node {
        /**Key-value pairs for all attributes for an xml.Element node. Returns null for all other node types. */
        attributes: object
        /**Absolute base uniform resource identifier (URI) of a node or null if the URI cannot be determined. */
        baseURI: string
        /**Array of all child nodes of a node or an empty array if there are no child nodes. */
        childNodes: N_xml.Node
        /**First child node for a specific node or null if there are no child nodes. */
        firstChild: N_xml.Node
        /**Last child node for a specific node or null if there is no last child node. */
        lastChild: N_xml.Node
        /**The local part of the qualified name of a node. */
        localName: string
        /**The namespace uniform resource identifier (URI) of a node or null if there is no namespace URI for the node. */
        namespaceURI: string
        /**The next node in a node list or null if the current node is the last node. */
        nextSibiling: N_xml.Node
        /**Name of a node, depending on the type. For example, for a node of type N_xml.Element, the name is the name of the element. */
        nodeName: string
        /**The type of node defined as a value from the xml.NodeType enum. */
        nodeType: string
        /**The value of a node, depending on its type. */
        nodeValue: string
        /**The root element for a node as a xml.Document object. */
        ownerDocument: N_xml.Document
        /**The parent node of a node. */
        parentNode: N_xml.Node
        /**The namespace prefix of the node, or null if the node does not have a namespace. */
        prefix: string
        /**The previous node in a node list or null if the current node is the first node. */
        previousSibling: N_xml.Node
        /**The textual content of a node and its descendants. */
        textContent: string

        /**
        * Appends a node after the last child node of a specific element node. Returns the new child node.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > HIERARCHY_REQUEST_ERR: An attempt was made to insert a node where it is not permitted.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43944
        */
        appendChild(options: {
            /** (Required) xml.Node object to append. */
            newChild: N_xml.node
        }): N_xml.Node

        /**
        * Creates a copy of a node. Returns the copied node.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43974
        */
        cloneNode(options: {
            /** (Optional) Use true to clone the node, attributes, and all descendents. Use false to only clone the node and attributes. */
            deep: boolean
        }): N_xml.Node

        /**
        * Returns a number that reflects where two nodes are located, compared to each other. Returns one of the following numbers:1. The two nodes do not belong to the same document.2. The specified node comes before the current node.4. The specified node comes after the current node.8. The specified node contains the current node.16. The current node contains the specified node.32. The specified and current nodes do not have a common container node or the two nodes are different attributes of the same node.The return value can be a combination of the above values. For example, a return value of 20 means the specified node is contained by the current node, a value of 16, and the specified node follows the current node, a value of 4.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected xml.Node or subclass: other
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43953
        */
        compareDocumentPosition(options: {
            /** (Required) The node to compare with the current node. */
            other: N_xml.node
        }): number

        /**
        * Returns true if the current node has attributes defined, or false otherwise.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43949
        */
        hasAttributes(): boolean

        /**
        * Returns true if the current node has child nodes or returns false if the current node does not have child nodes.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43833
        */
        hasChildNodes(): boolean

        /**
        * Inserts a new child node before an existing child node for the current node.If the new child node is already in the list of children, this method removes the new child node and inserts it again.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > HIERARCHY_REQUEST_ERR: An attempt was made to insert a node where it is not permitted.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43809
        */
        insertBefore(options: {
            /** (Required) The new child node to insert. */
            newChild: N_xml.node
            /** (Required) The node before which to insert the new child node.If refChild is , the method inserts the new node at the end of the list of children. */
            refChild: N_xml.node
        }): N_xml.Node

        /**
        * Returns true if the  specified namespace uniform resource identifier (URI) is the default namespace for the current node or returns false if the specified namespace is not the default namespace.See also Node.namespaceURI.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43971
        */
        isDefaultNamespace(options: {
            /** (Required) The namespace URI to compare. */
            namespaceURI: string
        }): boolean

        /**
        * Returns true if two nodes are equal or returns false if two nodes are not equal.The two nodes are equal if they meet the following conditions:Both nodes have the same type.Both nodes have the same attributes and attribute values. The order of the attributes is not considered.Both nodes have equal lists of child nodes and the child nodes appear in the same order.Two nodes may be equal, even if they are not the same. See Node.isSameNode(options).This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43826
        */
        isEqualNode(options: {
            /** (Required) The node to compare with the current node. */
            other: N_xml.node
        }): boolean

        /**
        * Returns true if two nodes reference the same object or returns false if two nodes do not reference the same object.If two nodes are the same, all attributes have the same values and you can use methods on the two nodes interchangeably.Two nodes that are the same are also equal. See Node.isEqualNode(options).This method is not supported on Internet Explorer or Firefox.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43847
        */
        isSameNode(options: {
            /** (Required) The node to compare with the current node. */
            other: N_xml.node
        }): boolean

        /**
        * Returns the namespace uniform resource identifier (URI) that matches the specified namespace prefix.Returns null if the specified prefix does not have an associated URI.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43973
        */
        lookupNamespaceURI(options: {
            /** (Required) Namespace prefix associated with the namespace URI. */
            prefix: string
        }): string

        /**
        * Returns the namespace prefix associated with the specified namespace uniform resource identifier (URI).Returns null if the specified URI does not have an associated prefix. If more than one prefix is associated with the namespace prefix, the namespace returned by this method depends on the module implementation.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43887
        */
        lookupPrefix(options: {
            /** (Required) Namespace URI associated the namespace prefix. */
            namespaceURI: string
        }): string

        /**
        * Puts all text nodes underneath a node, including attribute nodes, into a normal form. In normal form, only structure (such as elements, comments, processing instructions, CDATA sections, and entity references) separates text nodes. After normalization, there are no adjacent or empty text nodes.Use this method if you require a particular document tree structure and want to make sure that the XML DOM view of a document is identical when you save and reload it.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43904
        */
        normalize(): void

        /**
        * Removes the specified child node.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > NOT_FOUND_ERR: An attempt is made to reference a node in a context where it does not exist.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43859
        */
        removeChild(options: {
            /** (Required) Node to remove. */
            oldChild: N_xml.node
        }): N_xml.Node

        /**
        * Replaces a specific child node with another child node in a list of child nodes.If the new child node to add already exists in the list of child nodes, the node is first removed.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > NOT_FOUND_ERR: An attempt is made to reference a node in a context where it does not exist.
        * @Throws SSS_XML_DOM_EXCEPTION > HIERARCHY_REQUEST_ERR: An attempt was made to insert a node where it is not permitted.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43895
        */
        replaceChild(options: {
            /** (Required) New child node to add. */
            newChild: N_xml.node
            /** (Required) Child node to replaced with the new node. */
            oldChild: N_xml.node
        }): N_xml.Node

    }

    interface Document {
        /**Returns a node of type DOCUMENT_TYPE_NODE that represents the doctype of the XML document. */
        doctype: object
        /**Root node of the XML document. */
        documentElement: N_xml.Element
        /**Location of the document or null if undefined. */
        documentURI: string
        /**Encoding used for an XML document at the time the document was parsed. */
        inputEncoding: string
        /**Part of the XML declaration, the XML encoding of the XML document. */
        xmlEncoding: string
        /**Part of the XML declaration, returns true if the current XML document is standalone or returns false if it is not. */
        xmlStandalone: boolean
        /**Part of the XML declaration, the version number of the XML document. */
        xmlVersion: string

        /**
        * Attempts to adopt a node from another document to this document.If successful, this method changes the Node.ownerDocument property of the source node, its children, and any attribute nodes to the current document. If the source node has a parent node, the parent node is first removed from the child list of its own parent node.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > NOT_FOUND_ERR: An attempt is made to reference a node in a context where it does not exist.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43836
        */
        adoptNode(options: {
            /** (Required) Source node to add as a child into the current node object. */
            source: N_xml.node
        }): N_xml.Node

        /**
        * Creates an attribute node of type ATTRIBUTE_NODE with the optional specified value and returns the new xml.Attr object.The localName, prefix, and namespaceURI properties of the new node are set to null.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INVALID_CHARACTER_ERR: An invalid or illegal XML character is specified.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43886
        */
        createAttribute(options: {
            /** (Required) Name of the new attribute node. */
            name: string
            /** (Optional) Value for the attribute node. If unspecified, the value is an empty string. */
            value: string
        }): N_xml.Attr

        /**
        * Creates an attribute node of type ATTRIBUTE_NODE, with the specified namespace value and optional specified value, and returns the new xml.Attr object.The Node.localName, Node.prefix, and Node.namespaceURI properties of the new node are set to null.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INVALID_CHARACTER_ERR: An invalid or illegal XML character is specified.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43814
        */
        createAttributeNS(options: {
            /** (Required) Namespace URI of the attribute to create. Value can be null. */
            namespaceURI: string
            /** (Required) Qualified name of the new attribute node. */
            qualifiedName: string
            /** (Optional) Value for the attribute node. If unspecified, the value is an empty string. */
            value: string
        }): N_xml.Attr

        /**
        * Creates a CDATA section node of type DOCUMENT_FRAGMENT_NODE with the specified data and returns the new xml.Node object.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected string: data
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43976
        */
        createCDATASection(options: {
            /** (Required) Data for the new CDATA section node. */
            data: string
        }): N_xml.Node

        /**
        * Creates a Comment node of type COMMENT_NODE with the specified string.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43954
        */
        createComment(options: {
            /** (Required) Data for the Comment node. */
            data: string
        }): N_xml.Node

        /**
        * Creates a node of type DOCUMENT_FRAGMENT_NODE and returns the new N_xml.Node object.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43907
        */
        createDocumentFragment(): N_xml.Node

        /**
        * Creates a new node of type ELEMENT_NODE with the specified name and returns the new xml.Element node.The Node.localName, Node.prefix, and Node.namespaceURI properties of the new node are set to null.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INVALID_CHARACTER_ERR: An invalid or illegal XML character is specified.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43823
        */
        createElement(options: {
            /** (Required) Name of the element to create. */
            tagName: string
        }): N_xml.Element

        /**
        * Creates a new node of type ELEMENT_NODE with the specified namespace URI and name and returns the new xml.Element object.The Node.localName, Node.prefix, and Node.namespaceURI properties of the new node are set to null.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INVALID_CHARACTER_ERR: An invalid or illegal XML character is specified.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43917
        */
        createElementNS(options: {
            /** (Required) Namespace URI of the element to create. Can be null. */
            namespaceURI: string
            /** (Required) Qualified name of the element to create. */
            qualifiedName: string
        }): N_xml.Element

        /**
        * Creates a new node of type PROCESSING_INSTRUCTION_NODE with the specified target and data and returns the new N_xml.Node object.The following example shows a sample processing instruction:<?xml version="1.0"?>Use a processing instruction node to keep processor-specific information in the text of the XML document.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INVALID_CHARACTER_ERR: An invalid or illegal XML character is specified.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43838
        */
        createProcessingInstruction(options: {
            /** (Required) Target part of the processing instruction. */
            target: string
            /** (Required) Data for the processing instruction. */
            data: string
        }): N_xml.Node

        /**
        * Creates a new text node and returns the new xml.Node object.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43915
        */
        createTextNode(options: {
            /** (Required) Data for the text node. */
            data: string
        }): N_xml.Node

        /**
        * Returns the element that has an ID attribute with the specified value as an xml.Element object. Returns null if no such element exists.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43926
        */
        getElementById(options: {
            /** (Required) Unique ID value for an element. */
            elementId: string
        }): N_xml.Element

        /**
        * Returns an array of xml.Element objects with a specific tag name, in the order in which they appear in the XML document.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43908
        */
        getElementsByTagName(options: {
            /** (Required) Case-sensitive tag name of the element to match on. Use the * wildcard to match all elements. */
            tagName: string
        }): N_xml.Element[]

        /**
        * Returns an array of xml.Element objects with a specific tag name and namespace, in the order in which they appear in the XML document.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43967
        */
        getElementsByTagNameNS(options: {
            /** (Required) Namespace URI to match on. Use the * wildcard to match all namespaces. */
            namespaceURI: string
            /** (Required) Localname property to match on. Use the * wildcard to match all local names. */
            localName: string
        }): N_xml.Element[]

        /**
        * Imports a node from another document to this document. This method creates a new copy of the source node.If the deep parameter is set to true, it imports all children of the specified node. If set to false, it imports only the node itself.Method returns the imported xml.Node object.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > NOT_SUPPORTED_ERR: The implementation does not support the requested type of object or operation.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43903
        */
        importNode(options: {
            /** (Required) Node from another XML document to import. */
            importedNode: N_xml.node
            /** (Required) Use true to import the node, its attributes, and all descendents. Use false to only import the node and its attributes.This parameter is not supported on Internet Explorer. */
            deep: boolean
        }): N_xml.Node

    }

    interface Element {
        /**The tag name of this xml.Element object. */
        tagName: string

        /**
        * Returns the value of the specified attribute.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43909
        */
        getAttribute(options: {
            /** (Required) Name of the attribute for which to return the value. */
            name: string
        }): N_xml.Attr

        /**
        * Retrieves an attribute node by name.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50069
        */
        getAttributeNode(options: {
            /** (Required) The name of the attribute to return. */
            name: string
        }): N_xml.Attr

        /**
        * Returns an attribute node with the specified namespace URI and local name.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected string: namespaceURI
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43807
        */
        getAttributeNodeNS(options: {
            /** (Required) Namespace URI of the attribute to return. Value can be null. */
            namespaceURI: string
            /** (Required) Local name of the attribute to return. */
            localName: string
        }): string

        /**
        * Returns an attribute value with the specified namespace URI and local name.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected string: namespaceURI
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43832
        */
        getAttributeNS(options: {
            /** (Required) Namespace URI of the attribute to return. Value can be null. */
            namespaceURI: string
            /** (Required) Local name of the attribute to return. */
            localName: string
        }): string

        /**
        * Returns an array of descendant N_xml.Element objects with a specific tag name, in the order in which they appear in the XML document.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43811
        */
        getElementsByTagName(options: {
            /** (Required) Case-sensitive tag name of the element to match on. Use the * wildcard to match all elements. */
            tagName: string
        }): N_xml.Element[]

        /**
        * Returns an array of descendant xml.Element objects with a specific tag name and namespace, in the order in which they appear in the XML document.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected string: namespaceURI
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43857
        */
        getElementsByTagNameNS(options: {
            /** (Required) Namespace URI to match on. Use the * wildcard to match all namespaces. */
            namespaceURI: string
            /** (Required) Localname property to match on. Use the * wildcard to match all local names. */
            localName: string
        }): N_xml.Element[]

        /**
        * Returns true if the current element has an attribute with the specified name or if that attribute has a default value. Otherwise, returns false.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43829
        */
        hasAttribute(options: {
            /** (Required) Name of the attribute to match on. */
            name: string
        }): boolean

        /**
        * Returns true if the current element has an attribute with the specified local name and namespace or if that attribute has a default value. Otherwise, returns false.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected string: namespaceURI
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43924
        */
        hasAttributeNS(options: {
            /** (Required) Namespace URI of the attribute to match on. */
            namespaceURI: string
            /** (Required) Local name of the attribute to match on. */
            localName: string
        }): boolean

        /**
        * Removes the attribute with the specified name.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected string: name
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43901
        */
        removeAttribute(options: {
            /** (Required) Name of the attribute to remove. */
            name: string
        }): void

        /**
        * Removes the attribute specified as a xml.Attr object.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > NOT_FOUND_ERR: An attempt is made to reference a node in a context where it does not exist.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43849
        */
        removeAttributeNode(options: {
            /** (Required) N_xml.Attr object to remove. */
            oldAttr: N_xml.attr
        }): N_xml.Attr

        /**
        * Removes the attribute with the specified namespace URI and local name.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > Invalid argument type, expected string: namespaceURI
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43964
        */
        removeAttributeNS(options: {
            /** (Required) Namespace URI of the attribute node to remove. */
            namespaceURI: string
            /** (Required) Local name of the attribute node to remove. */
            localName: string
        }): void

        /**
        * Adds a new attribute with the specified name. If an attribute with that name is already present in the element, its value is changed to the value specified in method argument.If an attribute with the specified name already exists, the value of the attribute is changed to the value of the value parameter.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_​EXCEPTION > INVALID_CHARACTER_ERR: An invalid or illegal XML character is specified.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43863
        */
        setAttribute(options: {
            /** (Required) Name of the attribute to add. */
            name: string
            /** (Required) Value of the attribute to add. */
            value: string
        }): void

        /**
        * Adds the specified attribute node. If an attribute with the same name is already present in the element, it is replaced by the new one.If an attribute with the same nodeName property already exists, it is replaced with the object in the newAttr parameter. If the attribute node replaces an existing attribute node, the method returns the new xml.Attr object.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INUSE_ATTRIBUTE_ERR: An attempt is made to add an attribute that is already in use elsewhere.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43843
        */
        setAttributeNode(options: {
            /** (Required) New xml.Attr object to add to the xml.Element object. */
            newAttr: N_xml.attr
        }): N_xml.Attr

        /**
        * Adds the specified attribute node. If an attribute with the same local name and namespace URI is already present in the element, it is replaced by the new one.If an attribute with the same namespaceURI and localName property already exist, it is replaced with the object in the newAttr parameter. If the attribute node replaces an existing attribute node, the method returns the new xml.Attr object.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INUSE_ATTRIBUTE_ERR: An attempt is made to add an attribute that is already in use elsewhere.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43846
        */
        setAttributeNodeNS(options: {
            /** (Required) New xml.Attr object to add to the xml.Element object. */
            newAttr: N_xml.attr
        }): N_xml.Attr

        /**
        * Adds a new attribute with the specified name and namespace URI. If an attribute with the same name and namespace URI is already present in the element, its value is changed to the value specified in method argument.If an attribute with the specified name already exists, the value of the attribute is changed to the value of the value parameter. If the attribute node replaces an existing attribute node, the method returns the new xml.Attr object.This method is not supported on Internet Explorer.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_XML_DOM_EXCEPTION > INVALID_CHARACTER_ERR: An invalid or illegal XML character is specified.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43876
        */
        setAttributeNS(options: {
            /** (Required) Namespace URI of the attribute node to add. */
            namespaceURI: string
            /** (Required) Fully qualified attribute name to add. */
            qualifiedName: string
            /** (Required) String value of the attribute to add. */
            value: string
        }): void
    }

    interface Attr {
        /**The name of an attribute. */
        name: string
        /**The xml.Element object that is the parent of the xml.Attr object. */
        ownerElement: N_xml.Node
        /**Returns true if the attribute value is set in the parsed XML document, and false if it is a default value in a DTD or Schema. */
        specified: boolean
        /**Value of an attribute. The value of the attribute is returned as a string. Character and general entity references are replaced with their values. */
        value: string
    }
}