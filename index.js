/* eslint-disabled */
/* eslint-env node */
/* eslint-env browser */
"use strict";

module.exports = function feedmirror(fmSettings) {
  var request = new XMLHttpRequest();
  alert('test from github')

  // request the remote feed
  request.open("GET", fmSettings.feedURL, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // success!

      var data = request.responseText;

      // setup the embed
      var fmEmbed = document.getElementById(fmSettings.element);

      // check integration type
      if (fmSettings.integration != undefined) {
        var supportedIntegrations = ["medium", "instagram"];

        var supportedStyles = ["grid", "cards"];

        var isSupportedIntegration =
          supportedIntegrations.indexOf(fmSettings.integration) > -1;

        if (isSupportedIntegration) {
          if (fmSettings.style != undefined) {
            var isSupportedStyle =
              supportedStyles.indexOf(fmSettings.style) > -1;
            if (isSupportedStyle) {
              // add class to fm-embed
              fmEmbed.className = "fm-style-" + fmSettings.style;

              // prepare stylesheet
              var link = document.createElement("link");
              link.href =
                "https://data.feedmirror.com/embed/" +
                fmSettings.version +
                "/embed.min.css?fm";
              link.type = "text/css";
              link.rel = "stylesheet";
              link.media = "screen";

              document.getElementsByTagName("head")[0].appendChild(link);
            } else {
              console.log(
                'Feedmirror: integration style "' +
                  fmSettings.style +
                  '" is not supported.'
              );
              console.log(
                "Feedmirror: supported styles are: " + supportedStyles
              );
            }
          } // no style defined, so don't add class and stylesheet

          // start building the embed
          fmBuild(fmSettings.integration, data, fmEmbed);
        } else {
          console.log(
            'Feedmirror: integration "' +
              fmSettings.integration +
              '" is not supported.'
          );
          console.log(
            "Feedmirror: supported integrations are: " + supportedIntegrations
          );
        }
      } else {
        console.log("Feedmirror: integration is undefined.");
      }
    } else {
      // We reached our target server, but it returned an error
      console.log(
        "Feedmirror: The server returned an error (" +
          request.status +
          ").  Check the feed url."
      );
    }
  };

  function fmBuild(integrationType, data, fmEmbed) {
    var fmPostsWrapper = document.createElement("div");
    var fmPostsInnerWrapper = document.createElement("div");
    var fmLinkOut = document.createElement("div");
    var fmPoweredBy = document.createElement("div");

    fmPostsWrapper.className = "fm-" + integrationType + "-posts-wrapper";
    fmPostsInnerWrapper.className =
      "fm-" + integrationType + "-posts-inner-wrapper";
    fmLinkOut.className = "fm-" + integrationType + "-profile";
    fmPoweredBy.className = "fm-powered-by";
    var fmTarget;
    if (fmSettings.openNewTab == true) {
      fmTarget = "_blank";
    } else {
      fmTarget = "_self";
    }

    if (integrationType == "medium") {
      // Medium JSON has hijacking code at the beginning
      data = data.split("])}while(1);</x>")[1];
      data = JSON.parse(data);

      var fmMediumUser = "";
      var profileURL = "";
      var fmPosts = "";
      if (data.payload.user) {
        // this is a profile
        fmMediumUser = "@" + data.payload.user.username;
      } else {
        // this is a publication
        fmMediumUser = data.payload.collection.slug;
      }

      fmPosts = data.payload.references.Post;
      var fmPostKeys = Object.keys(fmPosts);
      var mediumImageCDN = "https://cdn-images-1.medium.com/fit/t/1600/480/";
      profileURL = "https://medium.com/" + fmMediumUser + "/";

      fmPostKeys.forEach(function (element, index) {
        var fmPost = document.createElement("div");
        fmPost.className = "fm-medium-post";

        // feed post data
        var post = fmPosts[element];
        var postVirtuals = post.virtuals;
        var postTitle = post.title;
        var postImage = postVirtuals.previewImage.imageId;
        var postSubTitle = post.content.subtitle;
        var postUniqueSlug = post.uniqueSlug;
        var postURL = profileURL + postUniqueSlug;
        var postImageHTML = "";

        if (fmSettings.showPostImages != false) {
          postImageHTML =
            '<img style="width: 100%" src="' +
            mediumImageCDN +
            postImage +
            '"/>';
        }

        var postTitleHTML = '<h4 class="fm-post-title">' + postTitle + "</h4>";
        var postSubTitleHTML =
          '<p class="fm-post-sub-title">' + postSubTitle + "</p>";

        fmPost.innerHTML =
          '<div class="fm-post"><a target="' +
          fmTarget +
          '" href="' +
          postURL +
          '">' +
          postImageHTML +
          '<div class="fm-meta"><div class="fm-meta-inner">' +
          postTitleHTML +
          postSubTitleHTML +
          "</div></div></a></div>";

        if (index <= fmSettings.postsCount - 1) {
          //console.log(fmSettings.postsCount);
          fmPostsInnerWrapper.appendChild(fmPost);
        }
      });
    }

    if (integrationType == "instagram") {
      data = JSON.parse(data);
      var profileUsername = data.graphql.user.username;
      profileURL = "https://instagram.com/" + profileUsername + "/";
      fmPosts = data.graphql.user.edge_owner_to_timeline_media.edges;

      fmPosts.forEach(function (element, index) {
        var fmPost = document.createElement("div");
        fmPost.className = "fm-instagram-post";

        var photoSrc = element.node.thumbnail_src;
        var photoLikeCount = element.node.edge_liked_by.count;
        var photoCommentCount = element.node.edge_media_to_comment.count;
        var photoShortCode = element.node.shortcode;

        var photoCaption = "";
        if (element.node.edge_media_to_caption.edges.length != 0) {
          photoCaption = element.node.edge_media_to_caption.edges[0].node.text;
        }

        var photoHTML = '<img src="' + photoSrc + '"/>';
        var photoMetaHTML =
          '<div class="fm-meta"><div class="fm-meta-inner"><span class="fm-icon fm-heart">' +
          photoLikeCount +
          '</span><span class="fm-icon fm-comment">' +
          photoCommentCount +
          "</span><p>" +
          photoCaption +
          "</p></div></div>";
        fmPost.innerHTML =
          '<a href="https://instagram.com/p/' +
          photoShortCode +
          '" target="' +
          fmTarget +
          '">' +
          photoHTML +
          photoMetaHTML +
          "</a>";
        if (index < fmSettings.postsCount) {
          fmPostsInnerWrapper.appendChild(fmPost);
        }
      });
    }

    fmPostsWrapper.appendChild(fmPostsInnerWrapper);
    fmEmbed.appendChild(fmPostsWrapper);

    if (fmSettings.linkToProfileText != undefined) {
      fmLinkOut.innerHTML =
        '<a href="' +
        profileURL +
        '" target="' +
        fmTarget +
        '" class="fm-profile button">' +
        fmSettings.linkToProfileText +
        "</a>";
      fmEmbed.appendChild(fmLinkOut);
    }

    if (fmSettings.poweredBy === true) {
      fmPoweredBy.innerHTML =
        '<a href="https://feedmirror.com" target="' +
        fmTarget +
        '">Powered by Feedmirror</a>';
      fmPostsWrapper.appendChild(fmPoweredBy);
    }
  }

  request.onerror = function () {
    // There was a connection error of some sort
    console.log("Feedmirror: There was an unknown error fetching the feed.");
  };

  request.send();
};
