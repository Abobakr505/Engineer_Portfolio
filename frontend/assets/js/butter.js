// butter.js
(function(root) {
    var Butter = function() {
        var self = this;

        // Default configuration options
        this.defaults = {
            wrapperId: 'butter', // ID of the wrapper element
            wrapperDamper: 0.07, // Smoothing factor for scroll animation
            cancelOnTouch: true // Cancel smooth scrolling on touch devices
        };

        // Method to merge user options with defaults
        this.validateOptions = function(ops) {
            for (var prop in ops) {
                if (self.defaults.hasOwnProperty(prop)) {
                    Object.defineProperty(self.defaults, prop, {
                        value: Object.getOwnPropertyDescriptor(ops, prop).value
                    });
                }
            }
        };

        // Instance variables
        this.wrapperDamper;
        this.wrapperId;
        this.cancelOnTouch;
        this.wrapper;
        this.wrapperOffset = 0;
        this.animateId;
        this.resizing = false;
        this.active = false;
        this.wrapperHeight;
        this.bodyHeight;
    };

    Butter.prototype = {
        init: function(options) {
            // Apply user options if provided
            if (options) {
                this.validateOptions(options);
            }

            // Initialize properties
            this.active = true;
            this.resizing = false;
            this.wrapperDamper = this.defaults.wrapperDamper;
            this.wrapperId = this.defaults.wrapperId;
            this.cancelOnTouch = this.defaults.cancelOnTouch;

            // Get the wrapper element
            this.wrapper = document.getElementById(this.wrapperId);
            this.wrapper.style.position = 'fixed';
            this.wrapper.style.width = '100%';

            // Set initial height
            this.wrapperHeight = this.wrapper.clientHeight;
            document.body.style.height = this.wrapperHeight + 'px';

            // Add event listeners
            window.addEventListener('resize', this.resize.bind(this));
            if (this.cancelOnTouch) {
                window.addEventListener('touchstart', this.cancel.bind(this));
            }
            this.wrapperOffset = 0.0;
            this.animateId = window.requestAnimationFrame(this.animate.bind(this));
        },

        wrapperUpdate: function() {
            // Calculate scroll position and apply damped transformation
            var scrollY = (document.scrollingElement != undefined) ?
                document.scrollingElement.scrollTop :
                (document.documentElement.scrollTop || 0.0);
            this.wrapperOffset += (scrollY - this.wrapperOffset) * this.wrapperDamper;
            this.wrapper.style.transform = 'translate3d(0,' + (-this.wrapperOffset.toFixed(2)) + 'px, 0)';
        },

        checkResize: function() {
            // Check if wrapper height has changed and trigger resize
            if (this.wrapperHeight != this.wrapper.clientHeight) {
                this.resize();
            }
        },

        resize: function() {
            var self = this;
            if (!self.resizing) {
                self.resizing = true;
                window.cancelAnimationFrame(self.animateId);
                window.setTimeout(function() {
                    self.wrapperHeight = self.wrapper.clientHeight;
                    if (parseInt(document.body.style.height) != parseInt(self.wrapperHeight)) {
                        document.body.style.height = self.wrapperHeight + 'px';
                    }
                    self.animateId = window.requestAnimationFrame(self.animate.bind(self));
                    self.resizing = false;
                }, 150);
            }
        },

        animate: function() {
            // Continuously update wrapper position and check for resize
            this.checkResize();
            this.wrapperUpdate();
            this.animateId = window.requestAnimationFrame(this.animate.bind(this));
        },

        cancel: function() {
            // Cancel smooth scrolling and reset styles
            if (this.active) {
                window.cancelAnimationFrame(this.animateId);
                window.removeEventListener('resize', this.resize);
                window.removeEventListener('touchstart', this.cancel);
                this.wrapper.removeAttribute('style');
                document.body.removeAttribute('style');
                this.active = false;
                this.wrapper = "";
                this.wrapperOffset = 0;
                this.resizing = true;
                this.animateId = "";
            }
        },
    };

    // Expose Butter instance to global scope
    root.butter = new Butter();
})(this);