/**
 * The main site/application module (entry point)
 */
;(function(w, d, $, Site){
    'use strict';

    Site.$html = $('html');
    Site.$body = $('body');

    Site.KEYCODES = {
        Esc: 27
    };

    Site.modules = Site.modules || {};

    Site.modules.Modal = (function () {
        var selectors = {
                modal: '.js-modal',
                overlay: '.js-modal-overlay',
                close: '.js-modal-close',
                trigger: '.js-modal-trigger'
            },
            states = {
                isHidden: 'is-hidden',
                isModalOpened: 'is-modal-opened'
            },
            events = {
                open: 'modal:open',
                opened: 'modal:opened',
                close: 'modal:close',
                closed: 'modal:closed'
            };

        function onModalTriggerClick(evt) {
            var modalId = $(this).data('modal-id'),
                $modal = $( '#' + modalId);

            if (!$modal.length) {
                return;
            }

            if (!$modal.hasClass(states.isHidden)) {
                return;
            }

            evt.preventDefault();
            // Hide all other modals
            $(selectors.modal).addClass(states.isHidden);
            $modal.removeClass(states.isHidden);
            Site.$body.addClass(states.isModalOpened);

            Site.$body.trigger(events.opened);
        }

        function onClickModalClose(evt) {
            var $modal = $(this).closest(selectors.modal);
            evt.preventDefault();
            $modal.addClass(states.isHidden);
            Site.$body.removeClass(states.isModalOpened);

            Site.$body.trigger(events.closed);
        }

        function onEscModalClose(evt) {
            var $modal;
            if (evt.keyCode === Site.KEYCODES.Esc) {
                $modal = $(selectors.modal);
                if (Site.$body.hasClass(states.isModalOpened)) {
                    $modal.addClass(states.isHidden);
                    Site.$body.removeClass(states.isModalOpened);

                    Site.$body.trigger(events.closed);
                }
            }
        }

        function onEventModalOpen(evt, modalId) {
            var $modal = $('#' + modalId);
            if (!$modal.length) {
                return;
            }
            if (!$modal.hasClass(states.isHidden)) {
                return;
            }
            // Hide all other modals
            $(selectors.modal).addClass(states.isHidden);
            $modal.removeClass(states.isHidden);
            Site.$body.addClass(states.isModalOpened);

            Site.$body.trigger(events.opened);
        }

        function onEventModalClose(evt) {
            var $modal = $(selectors.modal);
            if (Site.$body.hasClass(states.isModalOpened)) {
                $modal.addClass(states.isHidden);
                Site.$body.removeClass(states.isModalOpened);
            }

            Site.$body.trigger(events.closed);
        }

        return {
            init: function () {
                Site.$body
                    .on('click', selectors.trigger, onModalTriggerClick)
                    .on('click', selectors.close, onClickModalClose)
                    .on('click', selectors.overlay, onClickModalClose)
                    .on('keydown', onEscModalClose)
                    .on(events.open, onEventModalOpen)
                    .on(events.close, onEventModalClose);
            }
        }
    })();

    Site.modules.FullPage = (function() {
        var selectors = {
                fp_elem: '#fullpage',
                header: '.p-header',
                section: '.fp-section',
                activeSection: '.fp-section.active',
                interactiveBlock: '.js-interactive-block',
                interactiveBlockWrapper: '.js-interactive-block-wrapper',
                interactiveBlockMenu: '.interactive-block__menu',
                menu: '.js-menu',
                preloader: '#page-init-preloader',
                states: {
                    sticky: 'is-sticky',
                    orange: 'interactive-block--orange'
                }
            },
            SECTIONS = {
                intro: 1,
                build: 2,
                produce: 3,
                sell: 4,
                natura: 5,
                proluc: 6
            },
            $fp_elem,
            $fp_sections,
            $interactiveBlock,
            isInitialLoad = true,
            fp_options = {
                //Navigation
                menu: selectors.menu,
                lockAnchors: false,
                anchors:['intro', 'build', 'produce', 'sell', 'natura', 'proluc'],
                navigation: false,
                navigationPosition: 'right',
                navigationTooltips: [],
                showActiveTooltip: false,
                slidesNavigation: false,
                slidesNavPosition: 'bottom',

                //Scrolling
                css3: true,
                scrollingSpeed: 700,
                autoScrolling: true,
                fitToSection: true,
                fitToSectionDelay: 1000,
                scrollBar: false,
                easing: 'easeInOutCubic',
                easingcss3: 'ease',
                loopBottom: false,
                loopTop: false,
                loopHorizontal: true,
                continuousVertical: false,
                scrollOverflow: true,
                touchSensitivity: 5,
                normalScrollElementTouchThreshold: 5,

                //Accessibility
                keyboardScrolling: true,
                animateAnchor: true,
                recordHistory: true,

                //Design
                controlArrows: false,
                verticalCentered: false,
                resize : false,
                sectionsColor : [],
                paddingTop: 0,
                paddingBottom: 0,
                fixedElements: '.p-header, .p-footer, .p-modal, .js-interactive-block',
                responsiveWidth: 0,
                responsiveHeight: 0,

                //Custom selectors
                sectionSelector: '.section',
                slideSelector: '.slide',

                //events
                onLeave: function onLeave(index, nextIndex, direction){
                    var $currentSection = $fp_sections.eq(index - 1),
                        $nextSection = $fp_sections.eq(nextIndex - 1),
                        interactiveBlockCoords = {},
                        topPositionDifference = 0;

                    $currentSection.$interactiveBlockWrapper = $currentSection.find(selectors.interactiveBlockWrapper);
                    $currentSection.interactiveBlockWrapperOffset = $currentSection.$interactiveBlockWrapper.offset();

                    $nextSection.$interactiveBlockWrapper = $nextSection.find(selectors.interactiveBlockWrapper);
                    $nextSection.interactiveBlockWrapperOffset = $nextSection.$interactiveBlockWrapper.offset();

                    interactiveBlockCoords.left = $nextSection.interactiveBlockWrapperOffset.left;

                    if (direction === 'down') {
                        topPositionDifference = $nextSection.interactiveBlockWrapperOffset.top - $currentSection.interactiveBlockWrapperOffset.top;
                        interactiveBlockCoords.top = $nextSection.interactiveBlockWrapperOffset.top - topPositionDifference;
                    } else if (direction === 'up') {
                        // Use Math.abs because topPositionDifference should be signless (non-negative) number
                        topPositionDifference = Math.abs($nextSection.interactiveBlockWrapperOffset.top) + $currentSection.interactiveBlockWrapperOffset.top;
                        interactiveBlockCoords.top = $nextSection.interactiveBlockWrapperOffset.top + topPositionDifference;
                    }

                    $interactiveBlock.offset({
                        top: interactiveBlockCoords.top,
                        left: interactiveBlockCoords.left
                    });
                },
                afterRender: function afterRender(){
                    $fp_sections = $fp_elem.find(selectors.section);

                    $interactiveBlock.find(selectors.interactiveBlockMenu).addClass(selectors.menu.split('.')[1]);

                    // When any modal window is opened
                    // the fullpage's scrolling should be disabled
                    Site.$body.on('modal:opened', function () {
                        $.fn.fullpage.setAllowScrolling(false);
                        $.fn.fullpage.setKeyboardScrolling(false);
                    });

                    // And when a modal is closed scrolling is enabled again
                    Site.$body.on('modal:closed', function () {
                        $.fn.fullpage.setAllowScrolling(true);
                        $.fn.fullpage.setKeyboardScrolling(true);
                    });
                },
                afterLoad: function(anchorLink, index){
                    /**
                     * Need to position the interactiveBlock only for the first time,
                     * when the active section is loaded and it's not the intro.
                     * Need to set a setTimeout (100 milliseconds is set imperically)
                     * to wait till the section is fully loaded in order to get the right coords
                     * for the interactiveBlock.
                     **/
                    if (isInitialLoad) {
                        setTimeout(function () {
                            var $interactiveBlockWrapper = $(selectors.activeSection).find(selectors.interactiveBlockWrapper),
                                interactiveBlockCoords = $interactiveBlockWrapper.offset();

                            $interactiveBlock.offset({
                                top: interactiveBlockCoords.top,
                                left: interactiveBlockCoords.left
                            });

                            $(selectors.preloader).fadeOut(100);
                        }, 100);

                        isInitialLoad = false;
                    }

                    // After section with section-index < 5 is loaded
                    // make the interactiveBlock normal (not orange)
                    if (index < SECTIONS.natura) {
                        $interactiveBlock.removeClass(selectors.states.orange);
                    } else {
                        $interactiveBlock.addClass(selectors.states.orange);
                    }
                },
                afterResize: function(){},
                afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex){},
                onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex){}
            };

        return {
            init: function() {
                $fp_elem = $(selectors.fp_elem);

                if (!$fp_elem.length) return;

                $interactiveBlock = $(selectors.interactiveBlock);
                $interactiveBlock.addClass(selectors.states.sticky).appendTo(Site.$body);

                $fp_elem.fullpage(fp_options);
            }
        }
    })();

    Site.modules.InputMask = (function () {
        var selectors = {
                tel: 'input[type=tel]'
            },
            masks = {
                tel: '+7 (999) 999-99-99'
            },
            $telInput;

        return {
            init: function () {
                $telInput = $(selectors.tel);

                if (!$telInput.length) return;

                $telInput.inputmask(masks.tel);
            }
        };
    })();

    // The initialization on the jQuery Document Ready Event
    $(function(){
        Site.modules.FullPage.init();
        Site.modules.Modal.init();
        Site.modules.InputMask.init();
    });


})(window, document, jQuery, window.ARDOSite || {});