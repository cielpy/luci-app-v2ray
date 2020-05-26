"use strict";"require form";"require fs";"require rpc";"require uci";"require ui";"require view/v2ray/tools/converters as converters";var callRunningStatus=rpc.declare({object:"luci.v2ray",method:"runningStatus",params:[],expect:{"":{code:1}}}),callListStatus=rpc.declare({object:"luci.v2ray",method:"listStatus",params:["name"],expect:{"":{code:1}},filter:function(t){return 0===t.code?{count:t.count,datetime:t.datetime}:{count:0,datetime:_("Unknown")}}}),callV2RayVersion=rpc.declare({object:"luci.v2ray",method:"v2rayVersion",params:[],expect:{"":{code:1}},filter:function(t){return t.code?"":t.version}}),CUSTOMTextValue=form.TextValue.extend({__name__:"CUSTOM.TextValue",filepath:null,isjson:!1,required:!1,cfgvalue:function(){return this.filepath?L.resolveDefault(fs.read(this.filepath),""):this.super("cfgvalue",L.toArray(arguments))},write:function(t,e){if(!this.filepath)return this.super("write",L.toArray(arguments));var s=e.trim().replace(/\r\n/g,"\n")+"\n";return fs.write(this.filepath,s)},validate:function(t,e){if(this.required&&!e){var s=this.titleFn("title",t);return _("%s is required.").format(s)}if(this.isjson){var i=void 0;try{i=JSON.parse(e)}catch(t){i=null}if(!i||"object"!=typeof i)return _("Invalid JSON content.")}return!0}}),CUSTOMListStatusValue=form.AbstractValue.extend({__name__:"CUSTOM.ListStatusValue",listtype:null,onupdate:null,btnstyle:"button",btntitle:null,cfgvalue:function(){return this.listtype||L.error("TypeError",_("Listtype is required")),L.resolveDefault(callListStatus(this.listtype),{count:0,datetime:_("Unknown")})},render:function(t,e){return Promise.resolve(this.cfgvalue(e)).then(L.bind((function(s){var i=void 0===s?{}:s,n=i.count,r=void 0===n?0:n,a=i.datetime,o=void 0===a?"":a,u=this.titleFn("title",e),c=this.uciconfig||this.section.uciconfig||this.map.config,l=this.transformDepList(e),d=[E("div",{},[E("span",{style:"color: #ff8c00;margin-right: 5px;"},_("Total: %s").format(r)),_("Time: %s").format(o),E("button",{style:"margin-left: 10px;",class:"cbi-button cbi-button-%s".format(this.btnstyle||"button"),click:ui.createHandlerFn(this,(function(t,e,s){if("function"==typeof this.onupdate)return this.onupdate(s,t,e)}),e,this.listtype)},this.titleFn("btntitle",e)||u)])];"string"==typeof this.description&&""!==this.description&&d.push(E("div",{class:"cbi-value-description"},this.description));var v=E("div",{class:"cbi-value",id:"cbi-%s-%s-%s".format(c,e,this.option),"data-index":t,"data-depends":l,"data-field":this.cbid(e),"data-name":this.option,"data-widget":this.__name__},[E("label",{class:"cbi-value-title",for:"widget.cbid.%s.%s.%s".format(c,e,this.option)},[u]),E("div",{class:"cbi-value-field"},d)]);return l&&l.length&&v.classList.add("hidden"),v.addEventListener("widget-change",L.bind(this.map.checkDepends,this.map)),L.dom.bindClassInstance(v,this),v}),this))},remove:function(){},write:function(){}}),CUSTOMRunningStatus=form.AbstractValue.extend({__name__:"CUSTOM.RunningStatus",fetchVersion:function(t){L.resolveDefault(callV2RayVersion(),"").then((function(e){L.dom.content(t,e?_("Version: %s").format(e):E("em",{style:"color: red;"},_("Unable to get V2Ray version.")))}))},pollStatus:function(t){var e=E("em",{style:"color: red;"},_("Not Running")),s=E("em",{style:"color: green;"},_("Running"));L.Poll.add((function(){L.resolveDefault(callRunningStatus(),{code:0}).then((function(i){L.dom.content(t,i.code?e:s)}))}),5)},load:function(){},cfgvalue:function(){},render:function(){var t=E("span",{style:"margin-left: 5px"},E("em",{},_("Collecting data..."))),e=E("span",{},_("Getting..."));return this.pollStatus(t),this.fetchVersion(e),E("div",{class:"cbi-value"},[t," / ",e])},remove:function(){},write:function(){}}),CUSTOMOutboundImport=form.AbstractValue.extend({__name__:"CUSTOM.OutboundImport",btnstyle:null,handleModalSave:function(t){var e;if(t.triggerValidation(),t.isValid()&&(e=String(t.getValue()))&&(e=e.trim())){for(var s=e.split(/\r?\n/),i=0,n=0,r=s;n<r.length;n++){var a=r[n],o=void 0;if(a&&(o=converters.vmessLinkToVmess(a))&&"2"===o.v){var u=uci.add("v2ray","outbound");if(u){var c=o.add||"0.0.0.0",l=o.port||"0",d=o.tls||"",v=o.net||"",p=o.type||"",f=o.path||"",h=o.ps||"%s:%s".format(c,l);uci.set("v2ray",u,"alias",h),uci.set("v2ray",u,"protocol","vmess"),uci.set("v2ray",u,"s_vmess_address",c),uci.set("v2ray",u,"s_vmess_port",l),uci.set("v2ray",u,"s_vmess_user_id",o.id||""),uci.set("v2ray",u,"s_vmess_user_alter_id",o.aid||""),uci.set("v2ray",u,"ss_security",d);var m=[];switch(o.host&&(m=o.host.split(",")),v){case"tcp":uci.set("v2ray",u,"ss_network","tcp"),uci.set("v2ray",u,"ss_tcp_header_type",p),"http"===p&&m.length>0&&(uci.set("v2ray",u,"ss_tcp_header_request_headers",["Host=%s".format(m[0])]),"tls"===d&&uci.set("v2ray",u,"ss_tls_server_name",m[0]));break;case"kcp":case"mkcp":uci.set("v2ray",u,"ss_network","kcp"),uci.set("v2ray",u,"ss_kcp_header_type",p);break;case"ws":uci.set("v2ray",u,"ss_network","ws"),uci.set("v2ray",u,"ss_websocket_path",f);break;case"http":case"h2":uci.set("v2ray",u,"ss_network","http"),uci.set("v2ray",u,"ss_http_path",f),m.length>0&&(uci.set("v2ray",u,"ss_http_host",m),uci.set("v2ray",u,"ss_tls_server_name",m[0]));break;case"quic":uci.set("v2ray",u,"ss_network","quic"),uci.set("v2ray",u,"ss_quic_header_type",p),uci.set("v2ray",u,"ss_quic_key",f),m.length>0&&(uci.set("v2ray",u,"ss_quic_security",m[0]),"tls"===d&&uci.set("v2ray",u,"ss_tls_server_name",m[0]));break;default:uci.remove("v2ray",u);continue}i++}}}i>0&&uci.save(),ui.showModal(_("Outbound Import"),[E("p",{},i>0?_("Imported %d links.").format(s):_("No links imported.")),E("div",{class:"right"},E("button",{class:"btn",click:ui.hideModal},_("OK")))])}},handleImportClick:function(){var t=new ui.Textarea("",{rows:10,validate:function(t){return t?!!/^(vmess:\/\/[a-zA-Z0-9/+=]+\s*)+$/i.test(t)||_("Invalid links."):_("Empty field.")}});ui.showModal(_("Import multiple vmess:// links at once. One link per line."),[E("div",{},t.render()),E("div",{class:"right"},[E("button",{class:"btn",click:ui.hideModal},_("Dismiss"))," ",E("button",{class:"cbi-button cbi-button-positive important",click:ui.createHandlerFn(this,this.handleModalSave,t)},_("Save"))])])},load:function(){},cfgvalue:function(){},render:function(t,e){var s=this.titleFn("title",e);return E("div",{class:"cbi-value"},[E("button",{class:"cbi-button cbi-button-%s".format(this.btnstyle||"button"),click:L.bind(this.handleImportClick,this)},s),E("span",{style:"margin-left: 10px"},_("Allowed link format: <code>%s</code>").format("vmess://xxxxx"))])},remove:function(){},write:function(){}});return L.Class.extend({TextValue:CUSTOMTextValue,ListStatusValue:CUSTOMListStatusValue,RunningStatus:CUSTOMRunningStatus,OutboundImport:CUSTOMOutboundImport});