/*!
 * jQuery.scrollChaser.js
 *
 * Repositiory: https://github.com/yuku-t/jquery-scrollchaser
 * License:     MIT with starring the repository at GitHub.
 *              OR GPL without starring.
 * Author:      Yuku Takahashi
 */

;(function ($) {

  'use strict';

  var $window = $(window);

  var throttle = function (func, context, wait) {
    var previous = 0;
    return function () {
      var now, remaining;
      now = new Date();
      remaining = wait - (now - previous);
      if (remaining <= 0) {
        previous = now;
        return func.apply(context, arguments);
      }
    };
  };

  var ScrollChaser = (function () {

    function ScrollChaser($el, options) {
      this.$el = $el;
      this.$el.css({ width: this.$el.width() });
      this.ensureNonstaticPosition(options.wrapper);
      this.wrapBySentinels();
      this.offsetTop = options.offsetTop || 0;
      this.offsetBottom = options.offsetBottom || 0;
      $window.on('scroll',
                 throttle(this.onScroll, this, options.throttle || 10));
    }

    $.extend(ScrollChaser.prototype, {
      index: 0,
      state: 'top',  // top, fixed or bottom

      onScroll: function (e) {
        var sentinelTop, sentinelBottom, scrollTop, outerHeight;
        sentinelTop = this.sentinel.top.offset().top;
        scrollTop = $window.scrollTop();
        if (scrollTop + this.offsetTop < sentinelTop) {
          if (this.state !== 'top') {
            this.$el.css({
              position: 'relative',
              top: 0,
              bottom: ''
            });
            this.state = 'top';
          }
          return;
        }

        sentinelBottom = this.sentinel.bottom.offset().top;
        outerHeight = this.$el.outerHeight(true) + this.offsetBottom;
        if (this.state = 'top') {
          if (sentinelBottom - sentinelTop - outerHeight <= 0) {
            // No need to chase. Sidebar is taller than main contents.
            return;
          }
        }

        if (scrollTop + this.offsetTop + outerHeight > sentinelBottom) {
          if (this.state !== 'bottom') {
            this.$el.css({
              position: 'absolute',
              top: '',
              bottom: this.offsetBottom
            });
            this.state = 'bottom';
          }
        } else {
          if (this.state !== 'fixed') {
            this.$el.css({
              position: 'fixed',
              top: this.offsetTop,
              bottom: ''
            });
            this.state = 'fixed';
          }
        }
      },

      wrapBySentinels: function () {
        this.sentinel = {
          top:    $('<span></span>').css({ position: 'relative', height: 0 }),
          bottom: $('<span></span>').css({ position: 'absolute', bottom: 0 })
        };
        this.$el.before(this.sentinel.top).after(this.sentinel.bottom);
      },

      ensureNonstaticPosition: function ($el) {
        if ($el.css('position') === 'static') {
          $el.css('position', 'relative');
        }
      }
    });

    return ScrollChaser;
  })();

  $.fn.scrollChaser = function (options) {
    options || (options = {});
    if (!options.wrapper) {
      options.wrapper = $(document.body);
    } else if (!(options.wrapper instanceof $)) {
      options.wrapper = $(options.wrapper);
    }
    new ScrollChaser(this, options);
    return this;
  };

})(jQuery);
