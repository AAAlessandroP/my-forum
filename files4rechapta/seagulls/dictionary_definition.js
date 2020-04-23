!function(){var a=Handlebars.template,n=DDH.dictionary_definition=DDH.dictionary_definition||{};n.content=a(function(a,n,i,t,r){function e(a,n){var t,r,e="";return e+='\n    <span class="zci__def__word text--primary">',(r=i.plural_form)?t=r.call(a,{hash:{},data:n}):(r=a&&a.plural_form,t=typeof r===_?r.call(a,{hash:{},data:n}):r),e+=d(t)+'</span>\n</h3>\n<div class="zci__subheader">\n    Plural form of ',(r=i.word)?t=r.call(a,{hash:{},data:n}):(r=a&&a.word,t=typeof r===_?r.call(a,{hash:{},data:n}):r),e+=d(t)+', <span class="zci__def__pronunciation"></span>\n</div>\n'}function l(a,n){var t,r,e="";return e+='\n    <span class="zci__def__word text--primary">',(r=i.word)?t=r.call(a,{hash:{},data:n}):(r=a&&a.word,t=typeof r===_?r.call(a,{hash:{},data:n}):r),e+=d(t)+'</span>\n    <span class="zci__def__pronunciation"></span>\n</h3>\n'}function o(a,n){var t,r,e,l="";return l+='\n    <li>\n        <div class="zci__def__part-of-speech">'+d((r=i.Dictionary_formatPartOfSpeech||a&&a.Dictionary_formatPartOfSpeech,e={hash:{},data:n},r?r.call(a,a&&a.partOfSpeech,e):h.call(a,"Dictionary_formatPartOfSpeech",a&&a.partOfSpeech,e)))+'</div>\n        <div class="zci__def__definition">',r=i.Dictionary_formatDefinition||a&&a.Dictionary_formatDefinition,e={hash:{},data:n},t=r?r.call(a,a&&a.text,e):h.call(a,"Dictionary_formatDefinition",a&&a.text,e),(t||0===t)&&(l+=t),l+="</div>\n    </li>\n"}this.compilerInfo=[4,">= 1.0.0"],i=this.merge(i,a.helpers),r=r||{};var s,c,f,p="",_="function",d=this.escapeExpression,h=i.helperMissing,m=this,u=i.blockHelperMissing;return p+="<h3>\n",s=i["if"].call(n,n&&n.plural_form,{hash:{},inverse:m.program(3,l,r),fn:m.program(1,e,r),data:r}),(s||0===s)&&(p+=s),p+="\n\n<ul>\n",f={hash:{},inverse:m.noop,fn:m.program(5,o,r),data:r},(c=i.definitions)?s=c.call(n,f):(c=n&&n.definitions,s=typeof c===_?c.call(n,f):c),i.definitions||(s=u.call(n,s,{hash:{},inverse:m.noop,fn:m.program(5,o,r),data:r})),(s||0===s)&&(p+=s),p+='\n</ul>\n<div class="zci__def__links">\n    ',c=i.moreAt||n&&n.moreAt,f={hash:{},data:r},s=c?c.call(n,(s=n&&n.meta,null==s||s===!1?s:s.sourceUrl),(s=n&&n.meta,null==s||s===!1?s:s.sourceName),f):h.call(n,"moreAt",(s=n&&n.meta,null==s||s===!1?s:s.sourceUrl),(s=n&&n.meta,null==s||s===!1?s:s.sourceName),f),(s||0===s)&&(p+=s),p+='\n    <span class="zcm__sep"></span>\n    <span class="zci__def__attribution  tx-clr--lt2  t-s">'+d((s=n&&n.meta,s=null==s||s===!1?s:s.attributionText,typeof s===_?s.apply(n):s))+"</span>\n</div>"})}();(function(env){"use strict";var SPICE_ID="dictionary_definition",SPICE_PATH="/js/spice/dictionary",PARTS_OF_SPEECH={interjection:"interj.",noun:"n.","verb-intransitive":"v.","verb-transitive":"v.",adjective:"adj.",adverb:"adv.",verb:"v.",pronoun:"pro.",conjunction:"conj.",preposition:"prep.","auxiliary-verb":"v.",undefined:"","noun-plural":"n.",abbreviation:"abbr.","proper-noun":"n."};function checkApiResult(api_result){var result=api_result&&api_result.length&&api_result.filter(function(result){return result.text});return result}function render(definitions,pluralForm){var word=definitions[0].word,q=DDG.get_query(),firstResult=definitions[0];Spice.add({id:"dictionary_definition",name:"Definition",data:{word:word,plural_form:pluralForm,definitions:definitions},meta:{sourceName:"Wordnik",sourceUrl:"https://www.wordnik.com/words/"+word,attributionText:definitions[0].attributionText},templates:{group:"base",options:{content:Spice.dictionary_definition.content}},onShow:function(){if(is_mobile_device){DDG.require("audio",function(){})}}});if(!word.match(/\s/)){$.getJSON(SPICE_PATH+"/hyphenation/"+(pluralForm||word),function(api_result){if(!api_result||!api_result.length){return}var hyphenatedWord;for(var i=0,r;r=api_result[i];i++){if(i===r.seq){if(hyphenatedWord){hyphenatedWord+="•"+r.text}else{hyphenatedWord=r.text}}}hyphenatedWord=hyphenatedWord.replace(/^‖/,"");Spice.getDOM(SPICE_ID).find(".zci__def__word").text(hyphenatedWord)})}$.getJSON(SPICE_PATH+"/pronunciation/"+word,function(api_result){if(!api_result||!api_result.length>0)return;var firstResult=api_result[0];if(firstResult.rawType==="ahd-legacy"||firstResult.rawType==="ahd-5"){Spice.getDOM(SPICE_ID).find(".zci__def__pronunciation").html(firstResult.raw)}});$.getJSON(SPICE_PATH+"/audio/"+word,function(api_result){var $el=Spice.getDOM(SPICE_ID);if(!api_result||!api_result.length||!$el){return}var url=firstResult.fileUrl;for(var i=0,r;r=api_result[i];i++){if(r.createdBy==="macmillan"){url=r.fileUrl}}new DDG.Views.PlayButton({url:"/audio/?u="+encodeURIComponent(url),after:$el.find(".zci__def__pronunciation")})})}env.ddg_spice_dictionary_definition=function(api_result){var definitions=checkApiResult(api_result);if(!definitions||!definitions.length){return Spice.failed("dictionary_definition")}var firstResult=definitions[0],singular=firstResult.text.match(/^(?:A )?plural (?:form )?of <xref>([^<]+)<\/xref>/i);if(singular){var pluralForm=firstResult.word;$.getJSON(SPICE_PATH+"/reference/"+singular[1],function(api_result){var definitions=checkApiResult(api_result);if(!definitions||!definitions.length){return Spice.failed("dictionary_definition")}render(definitions,pluralForm)})}else{render(definitions)}};Spice.registerHelper("Dictionary_formatPartOfSpeech",function(text){return PARTS_OF_SPEECH[text]||text});Spice.registerHelper("Dictionary_formatDefinition",function(text){return text.replace(/<xref>([^<]+)<\/xref>/g,"<a class='reference' href='https://www.wordnik.com/words/$1'>$1</a>")})})(this);