// <t4 type="meta" meta="html_anchor" />
try {
    var conditions = [];
  
     
    function parseT4Tags (t4tag, cContent) {
      if (typeof cContent === 'undefined') {
          cContent = content;
      }
       
      if (typeof t4tag === 'string') {
          return com.terminalfour.publish.utils.BrokerUtils.processT4Tags (dbStatement, publishCache, section, cContent, language, isPreview, t4tag);
      } else {
          return '';
      }
    }
  	var headingElement = '<t4 type="content" name="Heading" output="normal" modifiers="striptags,htmlentities" />';
     
    var middle = 'text/middle';
    var contentTypes = [8080];
    conditions[0] = {
      'before':       'text/before',
      'after' :       'text/after',
      'if':           true,
    };  
     
    function applyConditions(cachedContent1, cachedContent2, contentTypeID1, contentTypeID2, i1, i2) {
      return parseT4Tags(headingElement, cachedContent2) != '';
    }
    /** advancedWrappingContentType used to handle the main function
    * @param middleLayout     string  (required) Content Layout called each time
    * @param beforeLayout     string  (optional) content layout called only when it is the first content ( if you don't want any before pass '')
    * @param afterLayout      string  (optional) content layout called only when it is the last content ( if you don't want any before pass '')
    * @param applyConditions  function (optional) function that can be determine which function need to be called.
    * @return boolean it will set first or last depending if the condition are met.
    */
    function advancedWrappingContentType(middleLayout,beforeLayout,afterLayout,contentTypes,applyConditions) {
      if (typeof beforeLayout !== 'string') {
        beforeLayout = '';
      }
      if (typeof afterLayout !== 'string') {
        afterLayout = '';
      }
      if (typeof middleLayout !== 'string' || middleLayout == '') {
        middleLayout = 'text/middle';
      }
       
       
      var tid, sid, mode, contentManager, formatter, first, last, format, formatString, relIndex, sectionContent,html;
      tid = content.getContentTypeID();
       
      if (typeof contentTypes !== 'object' || contentTypes == []) {
        var contentTypes = [tid];
      } else {
        contentTypes = contentTypes.map(Number);
        if (contentTypes.indexOf(tid) == -1) {
          contentTypes.push(tid);
        }
      }
       
       
       
      sid = section.getID();
      var mode = isPreview ? com.terminalfour.sitemanager.cache.CachedContent.CURRENT : com.terminalfour.sitemanager.cache.CachedContent.APPROVED;
      contentManager = com.terminalfour.spring.ApplicationContextProvider.getBean(com.terminalfour.content.IContentManager);
       
      sectionContent = com.terminalfour.sitemanager.cache.utils.CSHelper.extractCachedContent (com.terminalfour.sitemanager.cache.utils.CSHelper.removeSpecialContent(section.getContent (publishCache.getChannel (), language, mode, false)));
       
      formatter = afterLayout;
      first = false;
      last = false;
      html = '';
      relIndex = 0;
      contentManager = com.terminalfour.spring.ApplicationContextProvider.getBean( com.terminalfour.content.IContentManager );
      for (var i = 0; i < sectionContent.length; i++) {
        if (content.getID() == sectionContent[i].getID()) {
          if (i === 0) {
            first = true;
          } else if (contentTypes.indexOf(contentManager.getContentType(sectionContent[i-1].getID())) == -1 ) {
            first = true;
          } else {
            if (typeof applyConditions === "function") {
               
                first = applyConditions(
                contentManager.get(sectionContent[i-1].getID(),language),
                contentManager.get(sectionContent[i].getID(),language),
                contentManager.getContentType(sectionContent[i-1].getID()),
                contentManager.getContentType(sectionContent[i].getID()),
                relIndex-1,
                relIndex);
                 if (typeof first !== "boolean") {
                    first = false;
                 }
            } else {
                first = false;
            }
          }
           
          if (first) {
              relIndex = 0;
          }
     
          if (i === sectionContent.length-1) {
            last = true;
          } else if (contentTypes.indexOf(contentManager.getContentType(sectionContent[i+1].getID())) == -1) {
            last = true;
          } else {
            if (typeof applyConditions === "function") {
               
              last = applyConditions(
                contentManager.get(sectionContent[i].getID(),language),
                contentManager.get(sectionContent[i+1].getID(),language),
                contentManager.getContentType(sectionContent[i].getID()),
                contentManager.getContentType(sectionContent[i+1].getID()),
                relIndex,
                relIndex+1
              );
              if (typeof last !== "boolean") {
                last = false;
              }
            } else {
                last = false;
            }
          }
        }
         
         
        relIndex++;
      } //end for loop
      if(first && beforeLayout != '') {
        try {
        format        = publishCache.getTemplateFormatting(dbStatement, tid, beforeLayout);
        formatString  = format.getFormatting();
        html += com.terminalfour.publish.utils.BrokerUtils.processT4Tags(dbStatement, publishCache, section, content, language, isPreview, formatString);
        } catch(err) {
          throw "ERROR: "+beforeLayout+" does not exist";
        }
      }
      try {
        format        = publishCache.getTemplateFormatting(dbStatement, tid, middleLayout);
        formatString  = format.getFormatting();
        html += com.terminalfour.publish.utils.BrokerUtils.processT4Tags(dbStatement, publishCache, section, content, language, isPreview, formatString);
      } catch(err) {
          throw "ERROR: "+middleLayout+" does not exist";
      }
      if(last && afterLayout != '') {
        try {
          format        = publishCache.getTemplateFormatting(dbStatement, tid, afterLayout);
          formatString  = format.getFormatting();
          html += com.terminalfour.publish.utils.BrokerUtils.processT4Tags(dbStatement, publishCache, section, content, language, isPreview, formatString);
        } catch(err) {
          throw "ERROR: "+afterLayout+" does not exist";
        }
      }
       
      return html;
    }
    var html = '';
    for (prop in conditions) {
      if(conditions[prop]['if']) {
          html = advancedWrappingContentType(middle, conditions[prop]['before'],conditions[prop]['after'],contentTypes, applyConditions);
        break;
      }
    }
    document.write(html);
  } catch(err) {
    document.write(err);
  }
              