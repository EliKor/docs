$(function() {
  const $sidebar = $('#sidebar');
  const $sidebars = $('.js-sidebar');

  const navgocoOptions = {
    caretHtml: '',
    accordion: true,
    openClass: 'active',
    save: false,
    cookie: {
      name: 'navgoco',
      expires: false,
      path: '/'
    },
    slide: {
      duration: 150,
      easing: 'swing'
    }
  };

  // Initialize navgoco with config options
  $sidebar.navgoco($.extend(navgocoOptions, {
    onToggleAfter: function() {
      if ($(this.el).attr('id') == 'sidebar' &&
          $('#version-switcher').hasClass('open')) {
        closeVersionSwitcher();
      }
    }
  }));

  $sidebar.show();

  // Loop over the left sidebar and top nav mobile version
  $sidebars.each((k, sidebar)=>{
    // console.log(sidebar);
    // sidebar.navgoco($.extend(navgocoOptions, {
    //   onToggleAfter: function() {
    //     if ($(this.el).attr('id') == 'sidebar' &&
    //         $('#version-switcher').hasClass('open')) {
    //       closeVersionSwitcher();
    //     }
    //   }
    // }));
    // sidebar.show();
  });
});

// called from sidebar.js.html
function renderSidebar(sidebar) {
  // We derive the version from the URL rather than hardcoding
  // `page.version` so that the source of pages for "named"
  // versions, like stable and edge, can be identical to the
  // source for the underlying version, like v1.0 or v1.1.
  // Otherwise, the sidebar for a `stable` page would
  // inappropriately link to the underlying `v1.0` page instead
  // of the `stable` alias.
  const pageVersion = (function () {
    const pathComponents = location.pathname
      .replace(sidebar.baseUrl, '')
      .replace(/^\//, '')
      .split('/');
    // The version is the first directory component in the URL,
    // if it exists.
    if (pathComponents.length > 1 && sidebar.isVersionDirectory(pathComponents[0])) {
      return pathComponents[0];
    }
    // Non-versioned pages link to stable docs.
    return "stable";
  })();

  // Given a sidebar hierarchy (see _data/sidebar-data-v1.0.json
  // for an example), returns a jQuery <ul> element with the
  // following structure:
  //
  // <ul>
  //   <li class="tier-1">
  //    <a href="{{ item.url }}">{{ item.title }}</a>
  //     <ul>
  //       {% for item in item.items %}
  //         <li class="tier-2">...</li>
  //       {% endfor %}
  //     </ul>
  //   </li>
  // </ul>
  //
  // Additionally injects breadcrumbs for the active sidebar
  // entry, if any, into the `.collapsed-header` element above.
  function renderItems(items, paths) {
    if (!items || items.length == 0)
        return $();

    const lis = items.map(function (item) {
      const urls = (item.urls || []).map(function (url) {
        var url = url.replace("${VERSION}", pageVersion);
        // This condition makes it possible to use external
        // urls in the sidebar.
        if (!/^https?:/.test(url)) {
          url = sidebar.baseUrl + url;
        }
        return url;
      });

      // this ensures page will be highlighted in sidebar even if URL is accessed without `.html` appended
      const activePathname = location.pathname.slice(-5) === '.html' ? location.pathname : location.pathname + '.html';

      const active = (urls.indexOf(activePathname) !== -1);
      if (active) {
        // This mutation inside an otherwise pure function is
        // unfortunate, but doing it here avoids a separate
        // traversal of the sidebar data.
        const breadcrumbs = $("<div>")
          .addClass("collapsed-header__pre")
          .html(paths.join("<div class=\"arrow-down arrow-down--pre\"></div>\n"));

        const title = $("<div>").html(item.title);
        $(".collapsed-header").empty().append(breadcrumbs, title);
      }

      const subitems = renderItems(item.items, paths.concat(item.title));
      const a = $("<a>")
        .attr("href", urls[0] || "#")
        .html(item.title);

      if (subitems.length > 0 && !item.is_top_level) {
          a.append(" ").append($("<div>").addClass("nav-expand"));
      }

      return $("<li>")
        .addClass("tier-" + (paths.length + 1))
        .toggleClass("active", active)
        .toggleClass("visited", active)
        .append(a)
        .append(subitems);
    });

    return $("<ul>").append(lis);
  }

  const $sidebar = $('#sidebar');
  const $html = renderItems(sidebar.items, []).html();

  $sidebar.html($html)
    .find("li.active")
    .parents('li')
    .toggleClass("active");
};


