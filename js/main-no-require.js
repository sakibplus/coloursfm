/**
 *      CORE
 *
 */

if (typeof appCfg === "undefined") {
    console.warn('AppCfg not present');
}

if (typeof $ === "undefined") {
    console.warn('jQuery not present');
}

/**
 * Main AppEngine Object
 *
 *
 * @info For debug use in browser console <code>appEngine.dump();</code>
 *
 * @type {{ns, registrySet, registryGet, definitionSet, definitionGet, dump}}
 */
window.appEngine = (function (config, undefined) {
    // 'use strict';
    var _window = window;
    var cfg = config || {};
    var registry = {};
    var def = {};
    function nsFn (str) {
        var vs = str.split('.');
        var last = def;
        var n = vs.length;
        for (var i = 0; i < n; i++) {
            if (typeof last[vs[i]] !== "object") {
                last[vs[i]] = {};
            }
            last = last[vs[i]];
        }
        return last;
    }
    function nsSplit (str) {
        var vs = str.split('.');
        var n = vs.length - 1;
        var o1 = [];
        var o2 = vs[n];
        for (var i = 0; i < n; i++) {
            o1.push(vs[i]);
        }
        return {
            'path' : o1.join('.'),
            'file' : o2
        };
    }
    function registrySetFn (k, v) {
        registry[k] = v;
    }
    function registryGetFn (k) {
        return registry[k];
    }
    function definitionSetFn(key, def) {
        var ps = nsSplit(key);
        var obj = nsFn(ps.path);
        obj[ps.file] = def;
    }
    function definitionGetFn(key) {
        var ps = nsSplit(key);
        var obj = nsFn(ps.path);
        return obj[ps.file];
    }
    function dumpFn() {
        return {
            ns: nsFn,
            registrySet: registrySetFn,
            registryGet: registryGetFn,
            definitionSet: definitionSetFn,
            definitionGet: definitionGetFn,
            dump: dumpFn,
            _window: _window,
            cfg: cfg,
            registry: registry,
            def: def
        };
    }

    return {
        ns: nsFn,
        registrySet: registrySetFn,
        registryGet: registryGetFn,
        definitionSet: definitionSetFn,
        definitionGet: definitionGetFn,
        dump: dumpFn
    };
})({});


String.prototype.spliceHead = function(start, delCount, newSubStr) {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};


/**
 * Decorate AppEngine with 'app.utils.getAssetsBaseUrl'
 */
(function (appEngine) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.getAssetsBaseUrl',
        (function () {
            var url = window.appCfg.assetsBaseUrl;
            var urlDev = window.appCfg.assetsBaseDevUrl;
            return function (type) {
                if (type === 'dev') {
                    return urlDev;
                }
                return url;
            };
        })()
    );
    appEngine.definitionSet(
        'app.utils.isEnvWithRedirActive',
        (function () {
            var env = window.appCfg.redirEnvActive;
            return function () {
                if (env) {
                    return true;
                }
                return false;
            };
        })()
    );
})(appEngine);


/**
 * Decorate AppEngine with 'app.utils.uniqid'
 */
(function (appEngine) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.uniqid',
        (function () {
            var id = 0;
            return function () {
                if (arguments[0] === 0) {
                    id = 0;
                }
                return id++;
            };
        })()
    );
})(appEngine);

/**
 * Decorate AppEngine with 'app.utils.factoryJQueryRunnableContainerSet'
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.factoryJQueryRunnableContainerSet',
        (function (appEngine, $, undefined) {
            return function () {
                var stack = [];
                function addCallback(fn) {
                    if ( ! typeof fn === 'function') {
                        throw new Error('Invalid param - expecting function');
                    }
                    stack.push(fn);
                }
                function runOver($jqueryCollection) {
                    if ( ! $jqueryCollection instanceof $) {
                        throw new Error('Invalid param - expecting jquery collection');
                    }
                    for (var i = 0, n = stack.length; i < n; i++) {
                        try {
                            stack[i]($jqueryCollection);
                        } catch (e) {
                            // console.log(stack[i]);
                            console.log(e);
                        }
                    }
                }
                return {
                    addCallback: addCallback,
                    runOver: runOver
                };
            };
        })(appEngine, $)
    );
})(appEngine, $);


(function (appEngine, window, $, undefined) {
    // 'use strict';

    var videoLists = [];
    // window.videoLists = videoLists;

    var videoStopNotMe = function  (videoInstance) {
        var meId = videoInstance.getConfig().id;
        for (var i = 0, n = videoLists.length; i < n; i++) {
            var vidId = videoLists[i].getConfig().id;
            if (meId !== vidId) {
                var state = videoLists[i].getState();
                switch (state) {
                    case 'playing' :
                        // case 'buffering' :
                        videoLists[i].pause();
                        break;
                    default :
                        // no op
                        break;
                }
                // if (state !== 'paused') {
                //     try {
                //         videoLists[i].pause();
                //     } catch (e) {
                //         console.warn('Error while pausing video:', e);
                //     }
                // }
            }
        }
    };

    var videoStopAll = function () {
        for (var i = 0, n = videoLists.length; i < n; i++) {
            var vidId = videoLists[i].getConfig().id;
            var state = videoLists[i].getState();
            switch (state) {
                case 'playing' :
                    // case 'buffering' :
                    videoLists[i].pause();
                    break;
                default :
                    // no op
                    break;
            }
            // if (state !== 'paused') {
            //     try {
            //         videoLists[i].pause();
            //     } catch (e) {
            //         console.warn('Error while pausing video:', e);
            //     }
            // }
        }
    };

    appEngine.definitionSet(
        'app.utils.pauseAllVideos',
        (function (appEngine, $, window, undefined) {

            return function () {
                videoStopAll();
            };

        })(appEngine, $)
    );

    appEngine.definitionSet(

        'app.utils.addVideoToStash',
        (function (appEngine, $, window, undefined) {

            return function (videoInstance, gtmArticle) {

                videoInstance.__appGtmArticle = gtmArticle;

                videoLists.push(videoInstance);

                // console.log(videoLists);

                // console.log('adding video', videoInstance.getConfig().id);

                videoInstance.onPlay( function (e) {
                    console.log('playing video', this.getConfig().id);
                    videoStopNotMe(this);
                    $(".hide-on-play").hide();
                });

                // videoInstance.onPause( function () {
                //     // console.log('pausing video', this.getConfig().id);
                // });

                var eventOnPlay = true;

                videoInstance.onPlay(
                    function(e){
                        console.log('GTM-Video onPlay ...', this.__appGtmArticle);

                        if (eventOnPlay) {
                            var interaction = 'Video started';
                            eventOnPlay = false;
                        } else {
                            var interaction = 'Play';
                        }

                        dataLayer.push({
                            "event": "video",
                            "player_id": this.id,
                            "interaction": interaction,
                            "video_url": this.getPlaylistItem().file,
                            "duration": this.getDuration(),
                            "width": this.getWidth(),
                            "height": this.getHeight(),
                            "position": this.getPosition(),
                            "resolutions": [].map.call(this.getQualityLevels(), function(obj) {  return obj.label;}),
                            "volume": this.getVolume(),
                            "player_type": this.renderingMode,

                            "window_url": document.location.href,
                            "gtm_container": null // this.__appGtmArticle || {}
                        });
                    }
                );

                videoInstance.onComplete(
                    function(e){
                        console.log('GTM-Video onComplete ...', this.__appGtmArticle);
                        dataLayer.push({
                            "event": "video",
                            "player_id": this.id,
                            "interaction": "Video ended",
                            "video_url": this.getPlaylistItem().file,
                            "duration": this.getDuration(),
                            "width": this.getWidth(),
                            "height": this.getHeight(),
                            "position": this.getPosition(),
                            "resolutions": [].map.call(this.getQualityLevels(), function(obj) {  return obj.label;}),
                            "volume": this.getVolume(),
                            "player_type": this.renderingMode,

                            "window_url": document.location.href,
                            "gtm_container": null // this.__appGtmArticle || {}
                        });
                    }
                );

                videoInstance.onPause(
                    function(e){

                        var percentPlayed = Math.floor(this.getPosition()*100/this.getDuration());

                        if (percentPlayed < 50) {
                            var interaction = 'Video stopped before half';
                        } else {
                            var interaction = 'Video stopped after half';
                        }

                        $(".hide-on-play").show();
                        console.log('GTM-Video onPause ...', this.__appGtmArticle);

                        // Only for static
                        if (this.getDuration() !== Infinity) {

                            var percentPlayed = Math.floor(this.getPosition()*100/this.getDuration());

                            if (percentPlayed < 50) {
                                var interaction = 'Video stopped before half';
                            } else {
                                var interaction = 'Video stopped after half';
                            }

                            dataLayer.push({
                                "event": "video",
                                "player_id": this.id,
                                "interaction": interaction,
                                "video_url": this.getPlaylistItem().file,
                                "duration": this.getDuration(),
                                "width": this.getWidth(),
                                "height": this.getHeight(),
                                "position": this.getPosition(),
                                "resolutions": [].map.call(this.getQualityLevels(), function(obj) {  return obj.label;}),
                                "volume": this.getVolume(),
                                "player_type": this.renderingMode,

                                "window_url": document.location.href,
                                "gtm_container": null // this.__appGtmArticle || {}
                            });
                        }

                        dataLayer.push({
                            "event": "video",
                            "player_id": this.id,
                            "interaction": "Pause",
                            "video_url": this.getPlaylistItem().file,
                            "duration": this.getDuration(),
                            "width": this.getWidth(),
                            "height": this.getHeight(),
                            "position": this.getPosition(),
                            "resolutions": [].map.call(this.getQualityLevels(), function(obj) {  return obj.label;}),
                            "volume": this.getVolume(),
                            "player_type": this.renderingMode,

                            "window_url": document.location.href,
                            "gtm_container": null // this.__appGtmArticle || {}
                        });
                    }
                );

                videoInstance.onError(
                    function(e){
                        console.log('GTM-Video onError ...', this.__appGtmArticle);
                        dataLayer.push({
                            "event": "videoError",
                            "player_id": this.id,
                            "interaction": e.message,
                            "video_url": this.getPlaylistItem().file,
                            "duration": this.getDuration(),
                            "width": this.getWidth(),
                            "height": this.getHeight(),
                            "position": this.getPosition(),
                            "resolutions": [].map.call(this.getQualityLevels(), function(obj) {  return obj.label;}),
                            "volume": this.getVolume(),
                            "player_type": this.renderingMode,

                            "window_url": document.location.href,
                            "gtm_container": null // this.__appGtmArticle || {}
                        });
                    }
                );

                videoInstance.onFullscreen(
                    function(e){
                        console.log('GTM-Video onFullscreen ...', this.__appGtmArticle);
                        dataLayer.push({
                            "event": "video",
                            "player_id": this.id,
                            "interaction": "FullScreen " + (e.fullscreen ? "On" : "Off"),
                            "video_url": this.getPlaylistItem().file,
                            "duration": this.getDuration(),
                            "width": this.getWidth(),
                            "height": this.getHeight(),
                            "position": this.getPosition(),
                            "resolutions": [].map.call(this.getQualityLevels(), function(obj) {  return obj.label;}),
                            "volume": this.getVolume(),
                            "player_type": this.renderingMode,

                            "window_url": document.location.href,
                            "gtm_container": null // this.__appGtmArticle || {}
                        });
                    }
                );

                videoInstance.onMute(
                    function(e){
                        console.log('GTM-Video onMute ...', this.__appGtmArticle);
                        dataLayer.push({
                            "event": "video",
                            "player_id": this.id,
                            "interaction": "Mute " + (e.mute ? "On" : "Off"),
                            "video_url": this.getPlaylistItem().file,
                            "duration": this.getDuration(),
                            "width": this.getWidth(),
                            "height": this.getHeight(),
                            "position": this.getPosition(),
                            "resolutions": [].map.call(this.getQualityLevels(), function(obj) {  return obj.label;}),
                            "volume": this.getVolume(),
                            "player_type": this.renderingMode,

                            "window_url": document.location.href,
                            "gtm_container": null // this.__appGtmArticle || {}
                        });
                    });

            };

        })(appEngine, $, window)
    );
})(appEngine, window, $);

/**
 * Decorate AppEngine with 'app.utils.videoGetAdvertising'
 *
 * Demo setup:
 * <code>
 <div id="my-video"></div>
 <script type="text/javascript">
 jwplayer("my-video").setup({
        file: "http://content.jwplatform.com/videos/Wf8BfcSt-kNspJqnJ.mp4",
        image: "http://content.jwplatform.com/thumbs/Wf8BfcSt-640.jpg",
        width: "580",
        height: "370",
        primary: "flash",
        advertising: {
            client: "vast",
            schedule: {"myAds":{"offset":"pre","tag":"https://pubads.g.doubleclick.net/gampad/ads?sz=300x168|570x320|466x262&iu=/124748474/Test_Preroll&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=http%3A%2F%2Fdevtb.digi24.ro%2Flive%2Fdigi24&description_url=%5Bdescription%5D&correlator=1468867197898"}}
        }
    });
 * </code>
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.videoGetAdvertising',
        (function (appEngine, $, undefined) {
            return function ($article) {

                var $videoPreRoll = $("#videoPreRoll");

                if ($videoPreRoll && $videoPreRoll.length) {

                    //console.info("Video preroll code founded in page");

                    var videoPreRollJSON = $.parseJSON($videoPreRoll.html());

                    //console.log('videoPreRollJSON', videoPreRollJSON);

                    var videoPreRollParams = [];

                    for (preRollParam in videoPreRollJSON.params) {
                        videoPreRollParams.push(preRollParam + "=" + videoPreRollJSON.params[preRollParam]);
                    }

                    if (videoPreRollParams.length > 0) {
                        videoPreRollParams.push("url=" + window.encodeURIComponent(window.location.href));
                        videoPreRollParams.push("description_url=" + window.encodeURIComponent("[description]"));
                        videoPreRollParams.push("correlator="+ (new Date()).getTime());
                    }

                    var videoPreRollCode = videoPreRollJSON.url.toString() +"?"+ videoPreRollParams.join("&");

                    console.log(videoPreRollCode);

                    return {
                        client : "googima",
                        schedule: {
                            "myAdds" : {
                                "offset": "pre",
                                "tag": videoPreRollCode
                            }
                        }
                    };

                } else {
                    console.info("Cannot find #videoPreroll container in page!");
                    return {};
                }

            };
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Add registry "appArticleWidgets"
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.registrySet(
        'appArticleWidgets',
        (function (appEngine, $, undefined) {
            return (appEngine.definitionGet('app.utils.factoryJQueryRunnableContainerSet'))();
        })(appEngine, $)
    );
})(appEngine, $);

/**
* Add registry "appArticleWidgets"
*/
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.registrySet(
        'appCurrentSongWidgets',
        (function (appEngine, $, undefined) {
            return (appEngine.definitionGet('app.utils.factoryJQueryRunnableContainerSet'))();
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Add registry "appArticlePushAjax"
 */
(function (appEngine, $, undefined) {
    // 'use strict';

    appEngine.registrySet(
        'appArticlePushAjax',
        (function (appEngine, $, undefined) {
            return (appEngine.definitionGet('app.utils.factoryJQueryRunnableContainerSet'))();
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Decorate appArticlePushAjax with 'app.utils.initPushFBGA'
 */

(function (appEngine, $) {
    // 'use strict'
    appEngine.definitionSet(
        'app.utils.initPushFBGA',
        (function (appEngine, $, undefined) {
            return function(){

                if (typeof gtag === "undefined") {
                    console.log('AppCfg not present');
                } else {
                    console.log("push to GTAG");
                    //ga.push(["_trackPageview", window.location]);
                    gtag('send', 'pageview');
                }

                if (window.FB){
                    window.FB.XFBML.parse();
                    console.info("parse FB XFBML");
                }
            }
        })(appEngine, $)
    );
})(appEngine, $);


$.fn.extend({
    exists: function() {
        return this.length !== 0;
    },
});

// (function (appEngine, $, undefined) {
//     // 'use strict';
//     appEngine.definitionSet(
//         'app.utils.initAnalyticsSatiInContainer',
//         (function (appEngine, $, undefined) {
//             return function ($articleJqColl) {
//
//                 if (!$articleJqColl instanceof $) {
//                     throw new Error('Invalid param - expecting jquery collection');
//                 }
//
//                 console.log('SATI-ANALYTICS: (re)ping views - on the road');
//
//                 SATI_TrackView(document.location.href, document.referrer);
//
//             };
//         })(appEngine, $)
//     );
// })(appEngine, $);


/**
 * Populate "appArticlePushAjax" with initPushFBGA callback
 *
 */
(function (appEngine, undefined) {
    // 'use strict';
    appEngine.registryGet('appArticlePushAjax').addCallback(
        appEngine.definitionGet('app.utils.initPushFBGA')
    );
})(appEngine, $);



/**
 * Add registry "appArticleBindPageMeta"
 */
(function (appEngine, $, undefined) {
    // 'use strict';

    appEngine.registrySet(
        'appArticleBindPageMeta',
        (function (appEngine, $, undefined) {
            return (appEngine.definitionGet('app.utils.factoryJQueryRunnableContainerSet'))();
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Decorate appArticleBindPageMeta with 'app.utils.initBindPageMeta'
 */

(function (appEngine, $) {
    // 'use strict'
    appEngine.definitionSet(
        'app.utils.initBindPageMeta',
        (function (appEngine, $, undefined) {
            return function(){
                if (window.head && window.head !== "") {

                    var head = '<div>' + window.head + '</div>',  // won't parse if not inclosed in a html tag
                        $head = $($.parseHTML(head)),

                        // SEO
                        title = $head.find('title').html(),
                        keywords = $head.find('meta[name="keywords"]').attr("content"),
                        description = $head.find('meta[name="description"]').attr("content"),
                        canonical = $head.find('link[rel="canonical"]').attr("href"),

                        // Facebook
                        og_desc = $head.find('meta[property="og:description"]').attr("content"),
                        og_title = $head.find('meta[property="og:title"]').attr("content"),
                        og_url = $head.find('meta[property="og:url"]').attr("content"),
                        og_image = $head.find('meta[property="og:image"]').attr("content");

                    //SATI
                    pageclass = $head.find('meta[name="cXenseParse:pageclass"]').attr("content");

                    //console.log(title, keywords, description, canonical);
                    //console.log("og:description: " + og_desc, "og:title: " + og_title, "og:url: " + og_url, "og:image: " + og_image);

                    if (title)
                        $('title').text(title);

                    if (keywords)
                        $('meta[name="keywords"]').attr("content", keywords);

                    if (description)
                        $('meta[name="description"]').attr("content", description);

                    if (canonical)
                        $('link[rel="canonical"]').attr("href", canonical);

                    if (og_desc)
                        $('meta[property="og:description"]').attr("content", og_desc);

                    if (og_title)
                        $('meta[property="og:title"]').attr("content", og_title);

                    if (og_url)
                        $('meta[property="og:url"]').attr("content", og_url);

                    if (og_image)
                        $('meta[property="og:image"]').attr("content", og_image);

                    // /* SATI META */
                    // if (pageclass)
                    //     $('meta[name="cXenseParse:pageclass"]').attr("content", pageclass);
                    //
                    // if (canonical)
                    //     $('meta[name="cXenseParse:url"]').attr("content", canonical);



                    /*var oldHead = $('head').prop('innerHTML'),
                     satiPos = oldHead.indexOf('<!-- END Sati HEAD -->');

                     var ajaxCode = 'mumbo jumbo';

                     var newHead = oldHead.spliceHead(satiPos, 0, ajaxCode);

                    $('head').prop('innerHTML', newHead); */

                    //SATI
                    /* var head = document.getElementsByTagName('head')[0];
                     var script = document.createElement('script');
                     script.type = 'text/javascript';
                     script.onLoad = function() {
                     function SATI_TrackView(locationURL, referrerURL) {
                     if(locationURL === referrerURL) {return;}
                     window.cX = window.cX || {};
                     cX.callQueue = cX.callQueue || [];
                     cX.callQueue.push(['initializePage']);
                     cX.callQueue.push(['setSiteId', '1136227972865927398']);
                     cX.callQueue.push(['sendPageViewEvent', { 'location': locationURL, 'referrer':referrerURL}]);
                     };
                     }
                     head.appendChild(script); */

                    /*                    var body = document.getElementsByTagName('body')[0];
                     var script = document.createElement('script');
                     script.type = 'text/javascript';
                     script.async = '';
                     script.innerText = 'SATI_TrackView (document.location.href,document.referrer)';
                     body.appendChild(script);*/
                }
            }
        })(appEngine, $)
    );
})(appEngine, $);


/**
 * Populate "appArticleBindPageMeta" with initBindPageMeta callback
 *
 */
(function (appEngine, undefined) {
    // 'use strict';
    appEngine.registryGet('appArticleBindPageMeta').addCallback(
        appEngine.definitionGet('app.utils.initBindPageMeta')
    );
})(appEngine, $);




/**
 * Add registry "appArticleGetActiveMenu"
 */
(function (appEngine, $, undefined) {
    // 'use strict';

    appEngine.registrySet(
        'appArticleGetActiveMenu',
        (function (appEngine, $, undefined) {
            return (appEngine.definitionGet('app.utils.factoryJQueryRunnableContainerSet'))();
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Decorate appArticleGetActiveMenu with 'app.utils.initGetActiveItem'
 */

// (function (appEngine, $) {
//     // 'use strict'
//     appEngine.definitionSet(
//         'app.utils.initGetActiveItem',
//         (function (appEngine, $, undefined) {
//             return function(){
//                 var items = $('.nav-menu li.nav-menu-item');
//                 items.each(function (index) {
//                     var a = $(this).find('.nav-menu-item-link');
//
//                     $(this).removeClass('active');
//                     if (a.attr("href") === window.location.pathname) {
//                         $(this).addClass('active');
//                     }
//                 });
//             }
//         })(appEngine, $)
//     );
// })(appEngine, $);


/**
 * Populate "appArticleGetActiveMenu" with initGetActiveItem callback
 *
 */
(function (appEngine, undefined) {
    // 'use strict';
    appEngine.registryGet('appArticleGetActiveMenu').addCallback(
        appEngine.definitionGet('app.utils.initGetActiveItem')
    );
})(appEngine, $);


/**
 * Add registry "appLiveWidgets"
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.registrySet(
        'appLiveWidgets',
        (function (appEngine, $, undefined) {
            return (appEngine.definitionGet('app.utils.factoryJQueryRunnableContainerSet'))();
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Decorate AppEngine with 'app.utils.urlThumbToVideoUrl'
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.urlThumbToVideoUrl',
        (function (appEngine, $, undefined) {
            return function (src) {
                // console.log('POSTER IN', src);
                var newSrc = src; // src.replace(/%2F/g, '/').replace(/%3A/g, ':');
                // console.log('POSTER OUT', newSrc);
                return newSrc;
            };
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Add registry "appLiveFormWidgets"
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.registrySet(
        'appLiveFormWidgets',
        (function (appEngine, $, undefined) {
            return (appEngine.definitionGet('app.utils.factoryJQueryRunnableContainerSet'))();
        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Decorate AppEngine with 'app.utils.initVideoInContainer'
 *
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.initVideoInContainer',
        (function (appEngine, $, undefined) {
            return function ($articleJqColl) {
                appEngine.definitionGet('app.utils.pauseAllVideos')();

                if ( ! $articleJqColl instanceof $) {
                    throw new Error('Invalid param - expecting jquery collection');
                }
                var videoIndexInArticle = -1;

                $articleJqColl.find('.video').each( function (elem) {

                    var $video = $(this);
                    if ($video.attr('video-init')) {
                        return;
                    }

                    $video.attr('video-init', true);

                    var gtmVideoArticle = null;

                    // try {
                    //     // @NOTE We can have ".data-app-meta-article" OR ".data-app-meta-video-article" container !!
                    //     gtmVideoArticle = $.parseJSON($.trim(
                    //         $video.closest('.data-app-meta')
                    //             .find('script.app-entity-gtm-cfg[type="text/template"]')
                    //             .html()
                    //     ));
                    // } catch (e) {
                    //     console.warn('Video article gtm warn', e);
                    // }
                    // console.log('Gtm Video Parent Article', gtmVideoArticle);

                    try {

                        var jsonCfg = $.parseJSON($.trim($video.find('script[type="text/template"]').first().html()));

                        if (typeof jsonCfg !== 'object') {
                            throw new Error('Invalid video cfg');
                        }
                        if ( ! jsonCfg["shortcode"]) {
                            throw new Error('Invalid shortcode cfg new-info');
                        }

                        switch (jsonCfg["shortcode"]) {

                            case 'livestream' :
                                if ( ! jsonCfg["new-info"]) {
                                    throw new Error('Invalid livestream cfg new-info');
                                }
                                if ( ! jsonCfg["new-info"]["meta"]) {
                                    throw new Error('Invalid livestream cfg new-info meta');
                                }
                                if ( ! jsonCfg["new-info"]["meta"]["scope"]) {
                                    throw new Error('Invalid livestream cfg new-info meta message or scope or start or stop');
                                }
                                var scope = jsonCfg["new-info"]["meta"]["scope"];
                                var start = (jsonCfg["new-info"]["meta"]["start"] || 0) * 1000;
                                var stop = (jsonCfg["new-info"]["meta"]["stop"] || 0) * 1000;
                                var message = jsonCfg["new-info"]["meta"]["message"] || 'No info';
                                var displayLive = true;
                                if (start > 0 && stop > 0) {
                                    displayLive = false;
                                    var dtStartClient = (new Date()).getTime();
                                    if (start < dtStartClient && stop > dtStartClient) {
                                        displayLive = true;
                                    }
                                }
                                if ( ! displayLive) {
                                    // $video.html(message);
                                    return;
                                }
                                // @NOTE Special source (adaptive streaming)
                                var overwriteSource = jsonCfg["new-info"]["meta"]["useHlsAdaptive"] || '';
                                if ( ! overwriteSource) {
                                    var jqXhr = $.get('https://balancer.digi24.ro/streamer/make_key.php');
                                    (function (jqXhr, scope, start, stop, message, $video) {
                                        jqXhr.done(function (rsp) {
                                            $.when(
                                                $.get([
                                                    'https://balancer.digi24.ro/streamer.php?',
                                                    '&scope=', window.encodeURIComponent(scope),
                                                    '&key=', window.encodeURIComponent(rsp),
                                                    '&outputFormat=', window.encodeURIComponent('json'),
                                                    '&type=', window.encodeURIComponent('hls'),
                                                    '&quality=', window.encodeURIComponent('hq')
                                                ].join('')),
                                                $.get([
                                                    'https://balancer.digi24.ro/streamer.php?',
                                                    '&scope=', window.encodeURIComponent(scope),
                                                    '&key=', window.encodeURIComponent(rsp),
                                                    '&outputFormat=', window.encodeURIComponent('json'),
                                                    '&type=', window.encodeURIComponent('hls'),
                                                    '&quality=', window.encodeURIComponent('mq')
                                                ].join('')),
                                                $.get([
                                                    'https://balancer.digi24.ro/streamer.php?',
                                                    '&scope=', window.encodeURIComponent(scope),
                                                    '&key=', window.encodeURIComponent(rsp),
                                                    '&outputFormat=', window.encodeURIComponent('json'),
                                                    '&type=', window.encodeURIComponent('hls'),
                                                    '&quality=', window.encodeURIComponent('lq')
                                                ].join(''))
                                            ).always(function(rsp3, rsp2, rsp1) {

                                                var sources = [];


                                                var hqCfg = {};
                                                if (rsp3[1] == 'success') {
                                                    hqCfg = rsp3[0];
                                                }
                                                var hqIsHls = false;
                                                if (hqCfg.file) {
                                                    if (hqCfg.type == "HLS"
                                                        || hqCfg.type == "hls"
                                                    ) {
                                                        hqIsHls = true;
                                                    }
                                                    sources.push({
                                                        file: hqCfg.file,
                                                        "default": "true",
                                                        label: "HQ"
                                                    });
                                                }


                                                var mqCfg = {};
                                                if (rsp2[1] == 'success') {
                                                    mqCfg = rsp2[0];
                                                }
                                                var mqIsHls = false;
                                                if (mqCfg.file) {
                                                    if (mqCfg.type == "HLS"
                                                        || mqCfg.type == "hls"
                                                    ) {
                                                        mqIsHls = true;
                                                    }
                                                    sources.push({
                                                        file: mqCfg.file,
                                                        "default": "true",
                                                        label: "MQ"
                                                    });
                                                }


                                                var lqCfg = {};
                                                if (rsp1[1] == 'success') {
                                                    lqCfg = rsp1[0];
                                                }

                                                var lqIsHls = false;
                                                if (lqCfg.file) {
                                                    if (lqCfg.type == "HLS"
                                                        || lqCfg.type == "hls"
                                                    ) {
                                                        lqIsHls = false;
                                                    }
                                                    sources.push({
                                                        file: lqCfg.file,
                                                        "default": "true",
                                                        label: "LQ"
                                                    });
                                                }
                                                if (sources.length == 0) {
                                                    return;
                                                }
                                                var id = null;
                                                if ( ! $video.attr('id')) {
                                                    id = 'video-' + appEngine.definitionGet('app.utils.uniqid')();
                                                    $video.attr('id', id);
                                                } else {
                                                    id = $video.attr('id');
                                                }
                                                var player = jwplayer(id);
                                                var videoCfg = {
                                                    playlist: {
                                                        sources: sources
                                                    },
                                                    // file: "https://www.youtube.com/watch?v=eTWrGNka-ik",
                                                    // playlist: "/player/digi24.json",
                                                    // playlist: '/player/digi24.json';
                                                    // file: "/player/digi24.xml",
                                                    width: "100%",
                                                    aspectratio: "16:9",
                                                    autostart: true,
                                                    stretching: 'uniform', // exactfit
                                                    preload: 'auto',
                                                    controls: 'true',
                                                    // "sharing": {
                                                    //     "sites": ["reddit","facebook","twitter"]
                                                    // },
                                                    // hlslabels:{
                                                    //     "HQ":"High",
                                                    //     "MQ":"Medium",
                                                    //     "LQ":"Low"
                                                    // },
                                                    primary: "flash", // "html5"
                                                    // hlshtml: true,
                                                    flashplayer: '/static/js/vendor/jwplayer-7.9.3/jwplayer.flash.swf'
                                                };

                                                var advertising = appEngine.definitionGet('app.utils.videoGetAdvertising')();
                                                if (advertising) {
                                                    videoCfg.advertising = advertising;
                                                }
                                                // console.log(videoCfg, JSON.stringify(videoCfg));

                                                player.setup(videoCfg);
                                                // player.onReady(function(){
                                                //     var myLogo = document.createElement("div");
                                                //     myLogo.id = "myTestLogo";
                                                //     myLogo.setAttribute('style',"color: red; padding-left: 5px; margin-right: 5px; margin-top: 10px; background-image: url('/icon_dir.png');background-repeat: no-repeat;");
                                                //     myLogo.setAttribute('class','jw-icon jw-icon-inline jw-button-color jw-reset jw-icon-logo');
                                                //     myLogo.setAttribute('onclick','window.location="http://jwplayer.com"');
                                                //     document.getElementsByClassName('jw-controlbar-right-group')[0].appendChild(myLogo);
                                                // });
                                                //appEngine.definitionGet('app.utils.addVideoToStash')(player, gtmVideoArticle);
                                            });
                                        });
                                    })(jqXhr, scope, start, stop, message, $video);
                                } else {
                                    var jqXhr = $.get('https://balancer.digi24.ro/streamer/make_key.php');
                                    (function (jqXhr, scope, start, stop, message, $video) {
                                        jqXhr.done(function (rsp) {
                                            $.when(
                                                $.get([
                                                    'https://balancer.digi24.ro/streamer.php?',
                                                    '&scope=', window.encodeURIComponent(scope),
                                                    '&key=', window.encodeURIComponent(rsp),
                                                    '&outputFormat=', window.encodeURIComponent('json'),
                                                    '&type=', window.encodeURIComponent('abr'),
                                                    '&quality=', window.encodeURIComponent('hq')
                                                ].join(''))
                                            ).always(function(rsp3) {

                                                var hqCfg = {};
                                                // if (rsp3[1] == 'success') {
                                                //     hqCfg = rsp3[0];
                                                // }
                                                // @NOTE $.when(oneArg).always(function(oneElem) { ... })
                                                hqCfg = rsp3;

                                                var sources = [];


                                                var hqIsHls = false;
                                                if (hqCfg.file) {
                                                    if (hqCfg.type == "HLS"
                                                        || hqCfg.type == "hls"
                                                        || hqCfg.type == "ABR"
                                                        || hqCfg.type == "abr"
                                                    ) {
                                                        hqIsHls = true;
                                                    }
                                                    sources.push({
                                                        file: hqCfg.file,
                                                        "default": "true",
                                                        label: "HQ"
                                                    });
                                                }

                                                if (sources.length == 0) {
                                                    return;
                                                }

                                                var newSource = sources[0]['file'];

                                                //
                                                // @INFO Transform (harcoded @see geo [george.nasturas], @see )
                                                // From     "http://82.76.249.76:80/digi24edge/digi24hdhqhls/index.m3u8"
                                                // To       "http://81.196.0.126/digi24edge/smil:digi24.smil/playlist.m3u8" ($streamer/smil:$scope_name.smil/playlist.m3u8)
                                                //
                                                // @IMPORTANT Changed on 2016.08.01 by Geo in order to return playlist.m3u8
                                                //
                                                // var reg = /^.{1,}\/([^\/]{1,})\/(index\.m3u8).*$/;
                                                // var regRes = reg.exec(newSource);
                                                // if (regRes && regRes.length == 3) {
                                                //     newSource = newSource.replace(
                                                //         regRes[1] + '/' + regRes[2],
                                                //         "smil:digi24.smil" + "/" + "playlist.m3u8"
                                                //     );
                                                // }

                                                var id = null;
                                                if ( ! $video.attr('id')) {
                                                    id = 'video-' + appEngine.definitionGet('app.utils.uniqid')();
                                                    $video.attr('id', id);
                                                } else {
                                                    id = $video.attr('id');
                                                }
                                                var player = jwplayer(id);
                                                var videoCfg = {
                                                    file: newSource,
                                                    width: "100%",
                                                    aspectratio: "16:9",
                                                    autostart: true,
                                                    stretching: 'uniform', // exactfit
                                                    preload: 'auto',
                                                    controls: 'true',
                                                    // "sharing": {
                                                    //     "sites": ["reddit","facebook","twitter"]
                                                    // },
                                                    primary: "flash", // "html5"
                                                    // hlshtml: true,
                                                    flashplayer: '/static/js/vendor/jwplayer-8.7.4/jwplayer.flash.swf'
                                                };

                                                var advertising = appEngine.definitionGet('app.utils.videoGetAdvertising')();
                                                if (advertising) {
                                                    videoCfg.advertising = advertising;
                                                }
                                                // console.log(videoCfg, JSON.stringify(videoCfg));

                                                player.setup(videoCfg);
                                                // player.onReady(function(){
                                                //     var myLogo = document.createElement("div");
                                                //     myLogo.id = "myTestLogo";
                                                //     myLogo.setAttribute('style',"color: red; padding-left: 5px; margin-right: 5px; margin-top: 10px; background-image: url('/icon_dir.png');background-repeat: no-repeat;");
                                                //     myLogo.setAttribute('class','jw-icon jw-icon-inline jw-button-color jw-reset jw-icon-logo');
                                                //     myLogo.setAttribute('onclick','window.location="http://jwplayer.com"');
                                                //     document.getElementsByClassName('jw-controlbar-right-group')[0].appendChild(myLogo);
                                                // });
                                                //appEngine.definitionGet('app.utils.addVideoToStash')(player, gtmVideoArticle);
                                            });
                                        });
                                    })(jqXhr, scope, start, stop, message, $video);
                                }
                                break;

                            case 'video' :

                                // @IMPORTANT Only local videos are embeded (not galleries, livestreams, embeded-urls etc.)
                                videoIndexInArticle++;

                                if ( ! jsonCfg["new-info"]) {
                                    throw new Error('Invalid video cfg new-info');
                                }
                                if ( ! jsonCfg["new-info"]["meta"]) {
                                    throw new Error('Invalid video cfg new-info meta');
                                }
                                if ( ! jsonCfg["new-info"]["meta"]["source"]) {
                                    throw new Error('Invalid video cfg new-info meta source');
                                }
                                var source = jsonCfg["new-info"]["meta"]["source"];
                                var versions = jsonCfg["new-info"]["meta"]["versions"] || {};
                                var snapshots =  jsonCfg["new-info"]["meta"]["snapshots"] || [];
                                var sources = [];
                                var hdFound = false;
                                var hdVersionFound = null;
                                var defaultFound = false;
                                var defaultVersionFound = false;
                                $.each([
                                    "720p.mp4",
                                    "480p.mp4",
                                    "360p.mp4",
                                    "240p.mp4"
                                    // "android.mp4",
                                    // "iphone.mp4",
                                    // "bblackberry.mp4",
                                    // "ogv",
                                    // "webm"
                                ], function (i, kk) {
                                    if ( ! versions[kk]) {
                                        return;
                                    } else {
                                    }
                                    var e = kk;
                                    var file = versions[kk];
                                    var cfgs = e.split(".");
                                    var type = null;
                                    var lbl = null;
                                    if (cfgs.length > 1) {
                                        type = cfgs[cfgs.length - 1];
                                        lbl = cfgs.slice(0, cfgs.length - 1).join(".");
                                    } else {
                                        type = cfgs[0];
                                        lbl = cfgs[0];
                                    }
                                    if (
                                        ( ! hdFound && lbl == '720p')
                                        || ( ! hdFound && lbl == '480p')
                                        || ( ! hdFound && lbl == '240p')
                                    ) {
                                        hdFound = true;
                                        hdVersionFound = lbl;
                                    }
                                    var sourceDefaultItem = false;
                                    if (
                                        ( ! defaultFound && lbl == '480p')
                                        || ( ! defaultFound && lbl == '240p')
                                    ) {
                                        defaultFound = true;
                                        defaultVersionFound = lbl;
                                        sourceDefaultItem = true;
                                    }
                                    var source = {
                                        file: file,
                                        // type: type,
                                        label: lbl
                                    };
                                    if ( !! sourceDefaultItem) {
                                        source =  {
                                            file: file,
                                            // type: type,
                                            label: lbl,
                                            "default" : "true"
                                        };
                                    }
                                    sources.push(source);
                                });
                                if ( ! hdFound && sources.length) {
                                    // sources[0]["default"] = true;
                                    sources.unshift({
                                        file: source,
                                        label: "HD"
                                    });
                                } else if ( ! sources.length) {
                                    sources.unshift({
                                        file: source,
                                        label: "HD"
                                    });
                                } else {

                                }

                                // console.log(sources);

                                var image = snapshots[5] || snapshots[4] || snapshots[0] || null;

                                // @INFO Show embed-widget only in not inside iframe (videos in iframe are already embeded)
                                if (window.self === window.top) {
                                    var videoUrlArticle = $video.closest('.data-app-meta-article').attr('data-embed-base-url-canonical');
                                    if (videoUrlArticle) {
                                        var embedCode = appEngine.definitionGet('app.utils.extractVideoEmbedHtml')($video, videoUrlArticle, videoIndexInArticle);
                                        if (embedCode) {
                                            $(embedCode).insertAfter($video.parent());
                                        }
                                    }
                                }

                                var articleCfg = {};
                                try {
                                    articleCfg = $.parseJSON($.trim($video.closest('.data-app-meta')
                                        .find('script.app-entity-meta-cfg[type="text/template"]')
                                        .html()));
                                } catch (e) {
                                    console.warn(e);
                                    articleCfg = {};
                                }

                                // console.log(articleCfg);

                                var id = null;
                                if ( ! $video.attr('id')) {
                                    id = 'video-' + appEngine.definitionGet('app.utils.uniqid')();
                                    $video.attr('id', id);
                                } else {
                                    id = $video.attr('id');
                                }
                                var player = jwplayer(id);
                                var videoCfg = {
                                    image: image,
                                    sources: sources,
                                    width: "100%",
                                    aspectratio: "16:9",
                                    stretching: 'uniform', // exactfit
                                    primary: "html5",
                                    flashplayer: '/static/js/vendor/jwplayer-7.9.3/jwplayer.flash.swf',
                                };

                                var advertising = appEngine.definitionGet('app.utils.videoGetAdvertising')();
                                if (advertising) {
                                    videoCfg.advertising = advertising;
                                }
                                // console.log(videoCfg, JSON.stringify(videoCfg));

                                player.setup(videoCfg);
                                //appEngine.definitionGet('app.utils.addVideoToStash')(player, gtmVideoArticle);
                                break;

                            default :
                                throw new Error('Invalid video shortcode ' + jsonCfg["shortcode"]);
                                break;
                        }
                    } catch (e) {
                        console.warn('Video parse err', e);
                    }
                });
            }
        })(appEngine, $)
    );
})(appEngine, $);


/**
 * Decorate AppEngine with 'app.utils.initCurrentSongEngine'
 *
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.initCurrentSongEngine',
        (function (appEngine, $, undefined) {

            return function ($jqCollection) {

                var radioId = '';

                if (typeof window.radioId !== 'undefined') {
                    radioId = window.radioId;
                }

                if ($jqCollection.length) {
                    $jqCollection.each (function (el) {
                        var $this = $(this);

                        if (radioId != '') {
                            var hidden = "hidden";

                            // Standards:
                            if (hidden in document)
                                document.addEventListener("visibilitychange", onchange);
                            else if ((hidden = "mozHidden") in document)
                                document.addEventListener("mozvisibilitychange", onchange);
                            else if ((hidden = "webkitHidden") in document)
                                document.addEventListener("webkitvisibilitychange", onchange);
                            else if ((hidden = "msHidden") in document)
                                document.addEventListener("msvisibilitychange", onchange);
                            // IE 9 and lower:
                            else if ("onfocusin" in document)
                                document.onfocusin = document.onfocusout = onchange;
                            // All others:
                            else
                                window.onpageshow = window.onpagehide
                                    = window.onfocus = window.onblur = onchange;


                            var currentSong = '';

                            function onchange (evt) {
                                var v = "visible", h = "hidden",
                                    evtMap = {
                                        focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
                                    };

                                evt = evt || window.event;
                                if (evt.type in evtMap) {
                                    //document.body.className = evtMap[evt.type];
                                    document.body.setAttribute("tab", evtMap[evt.type]);
                                }
                                else {
                                    var visibility = this[hidden] ? "hidden" : "visible";
                                    document.body.setAttribute("tab", visibility);
                                }

                                if (document.body.getAttribute("tab") == 'visible') {
                                    currentSong = startCurrentSong();
                                } else {
                                    if (currentSong != '') {
                                        clearInterval(currentSong);
                                    }
                                }

                            }

                            // set the initial state (but only if browser supports the Page Visibility API)
                            if( document[hidden] !== undefined ) {
                                onchange({type: document[hidden] ? "blur" : "focus"});
                            }
                        }

                        function startCurrentSong() {

                            return setInterval(function() {

                                var xhr = $.ajax({
                                    url: '/api-current-song/' + radioId,
                                    method: 'GET',
                                });

                                xhr.done( function (rsp) {

                                    if (! rsp
                                        || ! $.isArray([rsp])
                                        || ! rsp.success
                                        || ! $.isArray([rsp.song])
                                        || rsp.songs.length == 0
                                    ) {
                                        console.log('Current song could not be retrieved!');
                                    } else {

                                        var appCurrentSong = $('.app-current-song');

                                        for (i = 0; i < rsp.songs.length; i++) {

                                            if (i == 0) { // current song
                                                if (appCurrentSong.length) {
                                                    appCurrentSong.text(rsp.songs[i].song);
                                                }
                                            } else {
                                                if ($('.app-last-song[data-last-song="' + i + '"]').length) {
                                                    $('.app-last-song[data-last-song="' + i + '"]').text(rsp.songs[i].song);
                                                }
                                            }
                                        }
                                    }
                                });
                                xhr.fail( function (jqXHR, textStatus, errorThrown) {
                                    console.log('Error when trying to get current song!');
                                });

                            }, 15000);
                        }
                    });
                }
            };

        })(appEngine, $)
    );
})(appEngine, $);

/**
 * Populate "appCurrentSongWidgets" with current song init callback
 *
 */
(function (appEngine, undefined) {
    // 'use strict';
    appEngine.registryGet('appCurrentSongWidgets').addCallback(appEngine.definitionGet('app.utils.initCurrentSongEngine'));
})(appEngine, $);

/**
 * Populate "appArticleWidgets" with initAnalyticsSatiInContainer callback
 *
 */
// (function (appEngine, undefined) {
//     // 'use strict';
//     appEngine.registryGet('appArticlePushAjax').addCallback(
//         appEngine.definitionGet('app.utils.initAnalyticsSatiInContainer')
//     );
// })(appEngine, $);


/**
 * Populate "appArticleWidgets" with initVideoInContainer callback
 *
 */
(function (appEngine, undefined) {
    // 'use strict';
    appEngine.registryGet('appArticleWidgets').addCallback(
        appEngine.definitionGet('app.utils.initVideoInContainer')
    );
})(appEngine, $);

/**
 * Populate "appLiveWidgets" with initVideoInContainer callback
 *
 */
(function (appEngine, undefined) {
    // 'use strict';
    appEngine.registryGet('appLiveWidgets').addCallback(
        appEngine.definitionGet('app.utils.initVideoInContainer')
    );
})(appEngine, $);



/**
 * Decorate AppEngine with 'app.utils.initIframeInContainer'
 *
 */
(function (appEngine, $, undefined) {
    // 'use strict';
    appEngine.definitionSet(
        'app.utils.initIframeInContainer',
        (function (appEngine, $, undefined) {

            return function ($articleJqColl) {

                if (! $articleJqColl instanceof $) {
                    throw new Error('Invalid param - expecting jquery collection');
                }
                var videoIndexInArticle = -1;

                $articleJqColl.find('.app-embed-from-url').each( function (elem) {

                    var $embed = $(this);
                    if ($embed.attr('iframe-init')) {
                        return;
                    }
                    $embed.attr('iframe-init', 1);

                    var w = $('.article-page-content').width();
                    var h = w*9/16;

                    $embed.html([
                        '<iframe marginwidth="0" marginheight="0" align="top" scrolling="No" frameborder="0" hspace="0" vspace="0" width="' + w + '" height="' + h + '" src="' + $embed.attr('data-src') + '" allowfullscreen>',
                        '</iframe>'
                    ].join(''));

                });
            }
        })(appEngine, $)
    );
})(appEngine, $);


/**
 * Populate "appArticleWidgets" with initIframeInContainer callback
 *
 */
(function (appEngine, undefined) {
    // 'use strict';
    appEngine.registryGet('appArticleWidgets').addCallback(
        appEngine.definitionGet('app.utils.initIframeInContainer')
    );
})(appEngine, $);

$(function () {

    if ( ! appEngine) {
        return;
    }

    //
    // @INFO article init ("#articles .item" container)
    //
    // @IMPORTANT It runs over the article container (it runs first at page load, an after this it runs at infinite scroll at custom IAS event "rendered")
    //
    // @date 2016-09-20 Callbacks contained:
    // - initVideoInContainer (init video)
    // - initIframeInContainer (init iframe)
    // - initAnalyticsInternalPingInContainer (init view counter)
    // - initAnalyticsGtmContainer (init gtm)
    // - initAnalyticsSatiInContainer (init sati)
    // @date 2016-09-23 Callbacks Add contained:
    // - initNavigationDigi24CodeContainer

    appEngine.registryGet('appArticleWidgets').runOver($('.article-page'));

    appEngine.registryGet('appCurrentSongWidgets').runOver($('.app-current-song').first());

    appEngine.registryGet('appLiveWidgets').runOver($('.article-page').find('.entry-video'));

    $isArticle = $("article");

    if ($isArticle.length) {
        $(window).resize(function() {

            var w = $('.app-video').width();
            var h = w*9/16;

            var $embed = $( ".app-embed-from-url" ).find('iframe');

            if ($embed.length) {
                $embed.attr('width', w).attr('height', h);
            }
        });
    }


    $('body').on('historyTrigger', function(e){
        appEngine.registryGet('appArticleWidgets').runOver($('.article-page'));
        appEngine.registryGet('appArticlePushAjax').runOver($('.article-page'));

        appEngine.registryGet('appArticleBindPageMeta').runOver($('head'));
        appEngine.registryGet('appArticleGetActiveMenu').runOver($('header'));
    });

    document.addEventListener('listenCount', function(e) {

        // initialize Cxense DMP Events
        window.cX = window.cX || {}; cX.callQueue = cX.callQueue || [];
        var prefix = 'brt';
        cX.callQueue.push(['setEventAttributes', { origin: prefix + '-audio', persistedQueryId: '2034d4bf8de8663be6b414ecf7e79bd37f5b1066' }]);

        var audioId = 'dancefm-1618991275222';

        console.log(e.detail.state);

        switch (e.detail.state) {

            case 'play':

                gtag('event', 'ClickButon_AscultaLive_Play', {
                    'event_category': 'ClickButon_AscultaLive_Play',
                    'event_label': 'ClickButon_AscultaLive_Play',
                });

                $(function () {
                    cX.callQueue.push(['sendEvent', 'play', {vid: audioId}]);
                });

                break;

            case 'pause':

                gtag('event', 'ClickButon_AscultaLive_Pause', {
                    'event_category': 'ClickButon_AscultaLive_Pause',
                    'event_label': 'ClickButon_AscultaLive_Pause',
                });

                $(function () {
                    cX.callQueue.push(['sendEvent', 'pause', {vid: audioId}]);
                });

                break;

            default:
                break
        }

    });
});
