var _ = {};

_._Events = {};

_.On = function (Elements, Type, Handler, Tag) {
	if (!Array.isArray(Elements))
		Elements = [Elements];
	var Types = Type.split(/\s+/g);
	for (var j = 0; j < Elements.length; j++) {
		var Element = Elements[j];
		for (var i = 0; i < Types.length; i++) {
			Types[i] = Types[i].toLowerCase();
			if (Types[i] != "") {
				if (window.addEventListener)
					Element.addEventListener(Types[i], Handler, false);
				else // Internet Explorer 5-8
					Element.attachEvent("on" + Types[i], Handler);
				if (!(Types[i] in _._Events))
					_._Events[Types[i]] = [];
				_._Events[Types[i]].push({Element: Element, Event: Types[i], Callback: Handler, Tag: Tag || ""});
			}
		}
	}
};

_.Off = function (Elements, Type, Handler, Tag) {
	Elements = Elements || false;
	if (Elements)
		if (!Array.isArray(Elements))
			Elements = [Elements];
	Type = Type || false;
	if (Type) {
		Type = Type.toLowerCase();
		Type = Type.split(/\s+/g);
	}
	_.Each(_._Events, function (EventName, EventList) {
		if (!Type || Type.indexOf(EventName) != -1)
			for (var j = EventList.length - 1; j >= 0; j--)
				if (!Elements || Elements.indexOf(EventList[j].Element) != -1)
					if (!Handler || EventList[j].Callback == Handler)
						if (!Tag || EventList[j].Tag == Tag) {
							if (window.removeEventListener)
								EventList[j].Element.removeEventListener(EventList[j].Event, EventList[j].Callback, false);
							else
								EventList[j].Element.detachEvent("on" + EventList[j].Event, EventList[j].Callback);
							EventList.splice(j, 1);
							if (EventList.length === 0) {
								delete _._Events[EventName];
								return;
							}
						}
	});
};

_.OffTag = function (Tag) {
	_.Each(_._Events, function (EventName, EventList) {
		for (var i = EventList.length - 1; i >= 0; i--)
			if (EventList[i].Tag == Tag) {
				if (window.removeEventListener)
					EventList[i].Element.removeEventListener(EventList[i].Event, EventList[i].Callback, false);
				else
					EventList[i].Element.detachEvent("on" + EventList[i].Event, EventList[i].Callback);
				EventList.splice(i, 1);
				if (EventList.length === 0) {
					delete _._Events[EventName];
					return;
				}
			}
	});
};

_.OffAll = function (Elements) {
	if (!Array.isArray(Elements))
		Elements = [Elements];
	for (var i = 0; i < Elements.length; i++) {
		for (var j = 0; j < Elements[i].children.length; j++)
			_.OffAll(Elements[i].children[j]);
		_.Off(Elements[i]);
	}
};

_.Dispatch = function (Elements, Types) {
	if (arguments.length < 2)
		return;
	if (!Array.isArray(Elements))
		Elements = [Elements];
	Types = Types.split(/\s+/g);
	
	_.Each(_._Events, function (EventName, EventList) {
		if (Types.indexOf(EventName) != -1)
			for (var i = 0; i < EventList.length; i++)
				if (Elements.indexOf(EventList[i].Element) != -1)
					EventList[i].Callback.call(this, new Event(EventName));
	});
};

_.Each = function (Instance, Callback) {
	for (var Key in Instance)
		if (Instance.hasOwnProperty(Key))
			Callback(Key, Instance[Key]);
};

_.EachAs = function (Instance, Callback) {
	for (var Key in Instance)
		if (Instance.hasOwnProperty(Key))
			Callback(Instance[Key], Key);
};

_.IndexOf = function (Object, Child) {
	if (Object.length)
		for (var i = 0; i < Object.length; i++)
			if (Object[i] == Child)
				return i;
	return -1;
};

_.HasAncestor = function (Descendant, Ancestor) {
	var Found = false;
	while (!Found)
		if (Descendant == Ancestor)
			Found = true;
		else
			if (Descendant.parentNode === null)
				break;
			else
				Descendant = Descendant.parentNode;
	return Found;
};

_.ElementMatch = function (Element, TestAttributes, TestProperties, PartialMatch) {
	var Found = false;
	var Items = 0;
	_.Each(TestAttributes, function() {
		Items++;
	});
	_.Each(TestProperties, function() {
		Items++;
	});
	while (!Found) {
		var Matches = 0;
		_.Each(TestAttributes, function (Attribute, Value) {
			if (Array.isArray(Value)) {
				for (var i = 0; i < Value.length; i++)
					if (Element.getAttribute(Attribute) == Value[i])
						Matches++;
			} else
				if (Element.getAttribute(Attribute) == Value)
					Matches++;
		});
		_.Each(TestProperties, function (Property, Value) {
			if (Array.isArray(Value)) {
				for (var i = 0; i < Value.length; i++)
					if (Element[Property] == Value[i])
						Matches++;
			} else
				if (Element[Property] == Value)
					Matches++;
		});
		if (Matches == Items || (PartialMatch && Matches > 0))
			Found = true;
		else
			if (Element.parentNode === null || Element.parentNode == document)
				break;
			else
				Element = Element.parentNode;
	}
	return Found && Element;
};

_.HasClass = function (Element, Class) {
	var Classes = Element.className.split(/\s+/g);
	if (Classes.indexOf(Class) != -1)
		return true;
	return false;
};

_.AddClass = function (Element, Class) {
	if (!_.HasClass(Element, Class))
		Element.className += " " + Class;
};

_.RemoveClass = function (Element, Class) {
	if (_.HasClass(Element, Class)) {
		var Classes = Element.className.split(/\s+/g);
		Classes.splice(Classes.indexOf(Class), 1);
		Element.className = Classes.join(" ");
	}
};

_.GetText = function (Element) {
	for (var i = 0; i < Element.childNodes.length; i++)
		if (Element.childNodes[i].nodeType == document.TEXT_NODE)
			return Element.childNodes[i].nodeValue;
	return "";
};

_.SetText = function (Element, Text) {
	for (var i = 0; i < Element.childNodes.length; i++)
		if (Element.childNodes[i].nodeType == document.TEXT_NODE) {
			Element.childNodes[i].nodeValue = Text;
			return;
		}
	var TextNode = document.createTextNode(Text);
	if (Element.childNodes.length === 0)
		Element.appendChild(TextNode);
	else
		Element.insertBefore(TextNode, Element.childNodes[0]);
};

_.Post = function (Url, Data, Success, Fail) {
	var PostData = "";
	_.Each(Data, function (Key, Value) {
		if (PostData.length > 0)
			PostData += "&";
		PostData += encodeURIComponent(Key).replace(/%20/g, "+") + "=" + encodeURIComponent(Value).replace(/%20/g, "+");
	});
	var Request = new XMLHttpRequest();
	Request.addEventListener("load", function (Event) {
		if (Success)
			Success.call(this, Request.responseText, Request);
	}, false);
	Request.addEventListener("error", function (Event) {
		if (Fail)
			Fail.call(this, Request.responseText, Request);
	}, false);
	Request.addEventListener("abort", function (Event) {
		if (Fail)
			Fail.call(this, Request.responseText, Request);
	}, false);
	Request.open("POST", Url, true);
	// Request.setRequestHeader("Cache-Control", "no-cache");
	Request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	Request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	Request.send(PostData);
};

_.PostJSON = function (Url, Data, Success, Fail) {
	_.Post(Url, function (Response, Request) {
		try {
			var Return = JSON.parse(Response);
			Success.call(this, Return, Response, Request);
		} catch (Error) {
			Fail.call(this, Response, Request);
		}
	}, Fail);
};

_.Get = function (Url, Success, Fail) {
	var Request = new XMLHttpRequest();
	Request.addEventListener("load", function (Event) {
		if (Success)
			Success.call(this, Request.responseText, Request);
	}, false);
	Request.addEventListener("error", function (Event) {
		if (Fail)
			Fail.call(this, Request.responseText, Request);
	}, false);
	Request.addEventListener("abort", function (Event) {
		if (Fail)
			Fail.call(this, Request.responseText, Request);
	}, false);
	Request.open("GET", Url, true);
	// Request.setRequestHeader("Cache-Control", "no-cache");
	Request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	Request.send(null);
};

_.GetJSON = function (Url, Success, Fail) {
	_.Get(Url, function (Response, Request) {
		try {
			var Return = JSON.parse(Response);
			Success.call(this, Return, Response, Request);
		} catch (Error) {
			Fail.call(this, Response, Request);
		}
	}, Fail);
};

_.CreateElement = function (TagName, Parent, Attributes, Properties) {
	if (Attributes === undefined || Attributes === null)
		Attributes = [];
	if (Properties === undefined || Properties === null)
		Properties = [];
	var Element = document.createElement(TagName.toUpperCase());
	_.Each(Attributes, function(Key, Value) {
		Element.setAttribute(Key, Value);
	});
	function SetProperty(ElementProp, Properties) {
		_.Each(Properties, function (Key, Value) {
			if (typeof Value == "object")
				SetProperty(ElementProp[Key], Value);
			else
				ElementProp[Key] = Value;
		});
	}
	SetProperty(Element, Properties);
	// _.Each(Properties, function(Key, Value) {
	// 	Element[Key] = Value;
	// });
	if (Parent !== undefined && Parent !== null)
		Parent.appendChild(Element);
	
	return Element;
};

_.CreateText = function (Text, Parent) {
	var Node = document.createTextNode(Text);
	if (Parent !== undefined && Parent !== null)
		Parent.appendChild(Node);
	
	return Node;
};