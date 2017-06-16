/**
 * 
 * EPG FULL plugin
 *
 */
(function($, window, document, undefined) {

    $.widget('epgfull', {

        _create: function() {

            var self = this
            var windowRef = $(window)
            var date = new Date()
            var weeksForward = 2
            var weeksBack = 4
            var queryString = self.getQueryString();
            var queryStringDate = queryString.date;
            var queryStringOrigin = queryString.origin;

            if (queryStringDate) {
                var queryStringDateParsed = queryStringDate.split('-');
                var queryStringDateParsedValid = new Date(queryStringDateParsed[0],queryStringDateParsed[1]-1,queryStringDateParsed[2]);
                var today = queryStringDateParsedValid;
            } else {
                var today = new Date();
            }

            var endDayEdge = new Date(new Date().setDate(date.getDate() + weeksForward * 7 - 1))
            var startDayEdge = new Date(new Date().setDate(date.getDate() - weeksBack * 7 + 1))

            var endWeekEdge = new Date(new Date().setDate(date.getDate() + weeksForward * 7))
            var startWeekEdge = new Date(new Date().setDate(date.getDate() - weeksBack * 7))

            var endDiff = endWeekEdge.getDay()
            if(endDiff == 0){
                endDiff = 7
            }

            endDiff = 7 - endDiff

            var startDiff = startWeekEdge.getDay()
            if(startDiff == 0){
                startDiff = 7
            }

            endWeekEdge = new Date(endWeekEdge.getFullYear(), endWeekEdge.getMonth(), endWeekEdge.getDate() + endDiff - 7)
            startWeekEdge = new Date(startWeekEdge.getFullYear(), startWeekEdge.getMonth(), startWeekEdge.getDate() - startDiff + 7)

            self.buildDatePicker(today, weeksForward, weeksBack)

            var week_selector = self.element.find('.date-selector .week-selector')
            var day_selector = self.element.find('.date-selector .day-selector')

            var nextDay = self.element.find('.date-selector .day-selector.next')
            var nextWeek = self.element.find('.date-selector .week-selector.next')
            var previousDay = self.element.find('.date-selector .day-selector.previous')
            var previousWeek = self.element.find('.date-selector .week-selector.previous')

            var selectedDay = today;

            if(selectedDay <= startWeekEdge) {
                previousWeek.addClass("disable")
            }
            if(selectedDay <= startDayEdge) {
                previousDay.addClass("disable")
            }

            if(selectedDay >= endWeekEdge) {
                nextWeek.addClass("disable")
            }
            if(selectedDay >= endDayEdge) {
                nextDay.addClass("disable")
            }


            var day_tab = self.element.find('.date-selector .day')
            day_tab.on('click', function(){
                if(!($(this).hasClass("disabled"))){
                    day_tab.removeClass("selected")
                    $(this).addClass("selected")
                    var request_date = new Date($(this).attr('request-date'));

                    self.datePicker(request_date);
                }
            })

            week_selector.on('click', function(){
                var selectedDay = new Date(self.element.find('.date-selector .day.selected').attr('request-date'))
                if($(this).hasClass('next')){
                    selectedDay = new Date(selectedDay.setDate(selectedDay.getDate() + 7))
                } else {
                    selectedDay = new Date(selectedDay.setDate(selectedDay.getDate() - 7))
                }
                self.datePicker(selectedDay);
            })

            day_selector.on('click', function(){
                var selectedDay = new Date(self.element.find('.date-selector .day.selected').attr('request-date'))
                if($(this).hasClass('next')){
                    selectedDay = new Date(selectedDay.setDate(selectedDay.getDate() + 1))
                } else {
                    selectedDay = new Date(selectedDay.setDate(selectedDay.getDate() - 1))
                }
                self.datePicker(selectedDay);
            })



            self.element.find('.thumb').on('mouseup', function(e){
                e.preventDefault()
                self.centerProgramDetails();
            })



            //Jump to Menu
            self.element.find('.period').on('click', function(e){
                e.preventDefault()
                var tinyScrollContainer = $('.epg-grid');
                var containerTimeline = $(tinyScrollContainer).data("plugin_tinyscrollbar");
                var period = $(this).attr('period');

                if (period == 'onnow') {
                    self.placeToOnNow(today);
                } else {
                    var periodPos = $('.period-' + period).position().left;
                    containerTimeline.update(scrollTo = periodPos-60)
                }
                self.centerProgramDetails();
            })

            self.placeOnNowBtOnCurrentDay(today);

            //Timeline scroll
            var tinyScrollContainer = $('.epg-grid');
            self.buildTinyScroll(tinyScrollContainer);

            self.element.find('.previousHour').on('click', function(e){
                e.preventDefault()
                var tinyScrollContainer = $('.epg-grid');
                var containerTimeline = $(tinyScrollContainer).data("plugin_tinyscrollbar");
                var currentPos = parseInt(containerTimeline.contentPosition)
                if (currentPos < 485) {
                    containerTimeline.update(0);
                    self.toPreviousNextDay('previous', today);
                } else {
                    containerTimeline.update(currentPos - 485);
                    self.centerProgramDetails();
                }
            })

            self.element.find('.nextHour').on('click', function(e){
                e.preventDefault()
                var tinyScrollContainer = $('.epg-grid');
                var containerTimeline = $(tinyScrollContainer).data("plugin_tinyscrollbar");
                var currentPos = parseInt(containerTimeline.contentPosition)
                if (currentPos > 10395) {
                    containerTimeline.update(10882);
                    self.toPreviousNextDay('next', today);

                } else {
                    containerTimeline.update(currentPos + 485);
                    self.centerProgramDetails();
                }
            })



            //Place scroll on live event
            self.placeToOnNow(today, queryStringOrigin);
            self.placeIndicatorAtOnNow(today);
            setInterval(function(){
                self.placeIndicatorAtOnNow(today);
                self.checkIfEventIsStillLive(today);
            }, 60000);



            //Grid
            var channels = $(".program-row");
            channels.each(function( index ) {
                var channel = $(this);
                var tags = channel.find('span');
                self.buildGrid(tags, today);
            });

            //Tooltip for small timeslots
            var isTouch = self.isTouchDevice();

            if (isTouch) {
                var timerTooltip;
                $('.program-slot').mouseover(function() {
                    var idEvent = $(this).attr('programid');
                    $('.tooltip.'+idEvent).fadeIn('fast');
                    timerTooltip = setTimeout(function(){
                        $('.tooltip').fadeOut('fast');
                    }, 2000);
                }).mouseout(function() {
                    $('.tooltip').fadeOut('fast');
                    clearTimeout(timerTooltip);
                });
            }

            self.resetGridHeight();

            var dateSelector = self.element.find('.date-selector-cont');
            var dateSelectorPos = dateSelector.offset().top;
            var epgTimeslot = self.element.find('.timelineMenu');
            var epgGrid = self.element.find('.viewport');

            if(windowRef.scrollTop() > dateSelectorPos) {
                $('.view-epgFull').addClass('sticky');
                dateSelector.addClass('sticky');
                epgTimeslot.addClass('sticky');
                epgGrid.addClass('sticky');
            } else {
                $('.view-epgFull').removeClass('sticky');
                dateSelector.removeClass('sticky');
                epgTimeslot.removeClass('sticky');
                epgGrid.removeClass('sticky');
            }

            windowRef.on('scroll',function(){
                if(windowRef.scrollTop() > dateSelectorPos){
                    $('.view-epgFull').addClass('sticky');
                    dateSelector.addClass('sticky');
                    epgTimeslot.addClass('sticky');
                    epgGrid.addClass('sticky');
                } else {
                    $('.view-epgFull').removeClass('sticky');
                    dateSelector.removeClass('sticky');
                    epgTimeslot.removeClass('sticky');
                    epgGrid.removeClass('sticky');
                }
            })

            //Show Program Details
            var programSlot = self.element.find('.program-slot');
            programSlot.on('click', function(e){
                e.preventDefault();
                var slot = $(this);
                var programid = slot.attr('programid');
                self.buildProgramDetails(programid);
            })

            //Close Program Details
            var closeBt = self.element.find('.program-details .close-bt');
            closeBt.on('click', function(e){
                e.preventDefault();
                self.closeProgramDetails();
            })

        },

        //Build Date Picker
        buildDatePicker: function(referenceDay, weeksForward, weeksBack, isWeek) {

            var self = this
            var date_selector = self.element.find('.date-selector li.day');
            var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
            var day = ['MON','TUE','WED','THU','FRI','SAT','SUN']

            var today = new Date()
            var todayDate = today.getDate()
            var todayMonth =  today.getMonth()
            var todayYear = today.getFullYear()
            var todayDay = today.getDay() - 1

            var startDay = new Date(todayYear, todayMonth, todayDate - weeksBack * 7)
            var endDay = new Date(todayYear, todayMonth, todayDate + weeksForward * 7)

            var referenceDate = referenceDay.getDate()
            var referenceMonth = referenceDay.getMonth()
            var referenceYear = referenceDay.getFullYear()

            var dayOfWeekIndex = referenceDay.getDay() - 1
            var sameWeek = false

            if(dayOfWeekIndex == -1){ //Sunday is returned as 0 from getDay
                dayOfWeekIndex = 6
            }
            if(todayDay == -1){
                todayDay = 6
            }

            //Get selected first
            date_selector.removeClass('selected')
            date_selector.removeClass('disabled')

            if(!(dayOfWeekIndex == 0)){ //We don't need to run this loop if Monday
                for(var i=dayOfWeekIndex, j=0; i >= 0; i--, j++ ){
                    var previousDay = new Date(referenceYear, referenceMonth, referenceDate - j)
                    var previousTab = $(date_selector[i])

                    if(i == todayDay){
                        if(todayDate == previousDay.getDate() && todayMonth == previousDay.getMonth()){
                            previousTab.find('.dayOfWeek').text("Today")
                            if(isWeek){
                                previousTab.addClass('selected')
                                //self.options.data.period = (new Date(new Date().setHours(0))).toISOString()
                                sameWeek = true;
                            }
                        } else {
                            previousTab.find('.dayOfWeek').text(day[i])
                        }
                    }

                    if(previousDay < startDay || previousDay > endDay){
                        previousTab.addClass("disabled")
                    }
                    previousTab.attr('request-date',previousDay.getFullYear() + "/" + (parseInt(previousDay.getMonth()) + 1) + "/" + previousDay.getDate())
                    previousTab.find('.date').text(previousDay.getDate() + " " + months[previousDay.getMonth()])
                }
            }

            if(!(dayOfWeekIndex == 6)){ //We don't need to run this loop if sunday

                for(var i=dayOfWeekIndex, j=0; i < 7; i++, j++ ){
                    var nextDay = new Date(referenceYear, referenceMonth, referenceDate + j)
                    var nextTab = $(date_selector[i])

                    if(i == todayDay){
                        if(todayDate == nextDay.getDate() && todayMonth == nextDay.getMonth()){
                            nextTab.find('.dayOfWeek').text("Today")
                            if(isWeek){
                                nextTab.addClass('selected')
                                //self.options.data.period = (new Date(new Date().setHours(0))).toISOString()
                                sameWeek = true;
                            }
                        } else {
                            nextTab.find('.dayOfWeek').text(day[i])
                        }
                    }

                    if(nextDay < startDay || nextDay > endDay){
                        nextTab.addClass("disabled")
                    }
                    nextTab.attr('request-date',nextDay.getFullYear() + "/" + (parseInt(nextDay.getMonth()) + 1) + "/" + nextDay.getDate())
                    nextTab.find('.date').text(nextDay.getDate() + " " + months[nextDay.getMonth()])
                }

            }
            if(!sameWeek && isWeek){
                for(var i = 0; i < date_selector.length; i++) {
                    var current = $(date_selector[i])
                    if(!(current.hasClass("disabled"))){
                        current.addClass("selected")
                        break;
                    }
                }
            } else if(!sameWeek){
                $(date_selector[dayOfWeekIndex]).addClass('selected')
            }

        },

        //Build Timeline Scroll
        buildTinyScroll: function(container) {
            $(container).tinyscrollbar({ axis: "x", wheel: false});
        },

        //Build the grid and place the event in the right spot in the timeline
        buildGrid: function(container, today) {
            var self = this;
            var tags = container;
            var indexOfLiveProgram = false;
            var isTouch = self.isTouchDevice();

            tags.each(function( index ) {
                var slot = $(this);
                var timestart = slot.attr("timestart");
                var timeend = slot.attr("timeend");
                var totalMinutesProgram = self.getTotalMinutesProgram(timestart, timeend);
                var positionInTimeline = self.getPositionInTimeline(timestart);

                slot.width(totalMinutesProgram).css('left', positionInTimeline);

                if (isTouch) {
                    if ((totalMinutesProgram+9) < 49) {
                        var slotId = slot[0].classList[1];
                        slot.addClass('small-slot');
                        $('.tooltip.'+slotId).css('left', positionInTimeline-20);
                    }
                }

                if (indexOfLiveProgram) {
                    slot.addClass('nextlivenow');
                    indexOfLiveProgram = false;
                }
                indexOfLiveProgram = self.addOnNow(slot, timestart, timeend, today, index);
            });

        },

        isTouchDevice: function () {
            var self = this;
            var nav = window.navigator,
                ua = window.navigator.userAgent.toLowerCase();

            if ((nav.appName.toLowerCase().indexOf("microsoft") != -1 || nav.appName.toLowerCase().match(/trident/gi) !== null) ||
                (ua.match(/chrome/gi) !== null) ||
                (ua.match(/firefox/gi) !== null) ||
                (ua.match(/webkit/gi) !== null) ||
                (ua.match(/gecko/gi) !== null) ||
                (ua.match(/opera/gi) !== null)) {
                return true;
            }
            return false

        },

        getTotalMinutesProgram: function (start, end) {
            var self = this;
            var start_time = start;
            var end_time = end;
            var start_hour = start_time.slice(0, -2);
            var start_minutes = start_time.slice(-2);
            var end_hour = end_time.slice(0, -2);
            var end_minutes = end_time.slice(-2);
            var startDate = new Date(0,0,0,start_hour, start_minutes);
            var endDate = new Date(0,0,0,end_hour, end_minutes);
            var millis = endDate - startDate;
            var minutes = ((millis/1000/60)*8)-9;
            return minutes;
        },

        getPositionInTimeline: function (timestart, buffer) {
            var bufferTimeline = ((buffer !== undefined) ? buffer : 0);
            var self = this;
            var start_time = timestart;
            var start_hour = start_time.slice(0, -2);
            var start_minutes = start_time.slice(-2);
            var startDate = new Date(0,0,0,0,0);
            var endDate = new Date(0,0,0,start_hour, start_minutes);
            var millis = endDate - startDate;
            var position = (((millis/1000/60)*8)+60)-bufferTimeline;
            return position;
        },

        //Check if event is on, if yes add "ON NOW" tag to DOM
        addOnNow: function(slot, timestart, timeend, today, index) {
            var self = this;
            var isOn = self.isItOn(timestart, timeend);

            var current = new Date();
            var todayDate = String(current.getDate());
            var todayMonth =  String(current.getMonth());
            var todayYear = String(current.getFullYear());
            var todayFinal = todayYear+todayMonth+todayDate;

            var refDate = today;
            var reftodayDate = String(refDate.getDate());
            var reftodayMonth =  String(refDate.getMonth());
            var reftodayYear = String(refDate.getFullYear());
            var reftodayFinal = reftodayYear+reftodayMonth+reftodayDate;


            if (todayFinal == reftodayFinal) {
                if (isOn) {
                    slot.find('.on-now').css('display', 'table');
                    slot.find('.title').css('font-weight', 'bold');
                    slot.addClass('livenow');
                    slot.removeClass('nextlivenow');
                    return true;
                } else {
                    slot.find('.on-now').css('display', 'none');
                    slot.find('.title').css('font-weight', 'normal');
                    if (index == 0) {
                        slot.addClass('livenow');
                        return true;
                    } else {
                        slot.removeClass('livenow');
                    }
                    return false;
                }
            } else {
                slot.find('.on-now').css('display', 'none');
                slot.find('.title').css('font-weight', 'normal');
                if (index == 0) {
                    slot.addClass('livenow');
                } else if (index == 1) {
                    slot.addClass('nextlivenow');
                } else {
                    slot.removeClass('livenow');
                    slot.removeClass('nextlivenow');
                }
                return false;
            }

        },

        getCurrentTime: function() {
            var self = this;
            var currentTime = new Date();
            var currentTimeStamp = addZero(currentTime.getHours().toString())+addZero(currentTime.getMinutes().toString());
            function addZero(i) {
                if (i < 10) { i = '0' + i;}
                return i;
            }

            return currentTimeStamp;
        },

        placeIndicatorAtOnNow: function(date) {
            var self = this;
            var indicator = self.element.find('.indicator');
            var indicatorBar = self.element.find('.indicator-bar');
            var currentTime = self.getCurrentTime();
            var positionInTimelineTag = self.getPositionInTimeline(currentTime, 20);
            var positionInTimeline = self.getPositionInTimeline(currentTime);

            var today = new Date();
            var todayDate = String(today.getDate());
            var todayMonth =  String(today.getMonth());
            var todayYear = String(today.getFullYear());
            var todayFinal = todayYear+todayMonth+todayDate;

            var refDate = date;
            var reftodayDate = String(refDate.getDate());
            var reftodayMonth =  String(refDate.getMonth());
            var reftodayYear = String(refDate.getFullYear());
            var reftodayFinal = reftodayYear+reftodayMonth+reftodayDate;

            if (todayFinal == reftodayFinal) {
                indicator.css('display', 'block');
                indicatorBar.css('display', 'block');
                indicator.css('left', positionInTimelineTag);
                indicatorBar.css('left', positionInTimeline);
            }

        },

        placeOnNowBtOnCurrentDay: function(date) {
            var self = this;
            var onnowbt = self.element.find('.onnowbt');
            var today = new Date();
            var todayDate = String(today.getDate());
            var todayMonth =  String(today.getMonth());
            var todayYear = String(today.getFullYear());
            var todayFinal = todayYear+todayMonth+todayDate;

            var refDate = date;
            var reftodayDate = String(refDate.getDate());
            var reftodayMonth =  String(refDate.getMonth());
            var reftodayYear = String(refDate.getFullYear());
            var reftodayFinal = reftodayYear+reftodayMonth+reftodayDate;

            if (todayFinal == reftodayFinal) {
                onnowbt.css('display', 'block');
            } else {
                onnowbt.css('display', 'none');
            }

        },

        placeToOnNow: function(date, queryStringOrigin) {
            var self = this;
            var queryStringOrigin = ((queryStringOrigin !== undefined) ? queryStringOrigin : 0);
            var currentTime = self.getCurrentTime();
            var position = self.getPositionInTimeline(currentTime);

            var today = new Date();
            var todayDate = String(today.getDate());
            var todayMonth =  String(today.getMonth());
            var todayYear = String(today.getFullYear());
            var todayFinal = todayYear+todayMonth+todayDate;

            var refDate = date;
            var reftodayDate = String(refDate.getDate());
            var reftodayMonth =  String(refDate.getMonth());
            var reftodayYear = String(refDate.getFullYear());
            var reftodayFinal = reftodayYear+reftodayMonth+reftodayDate;

            var tinyScrollContainer = $('.epg-grid');
            var containerTimeline = $(tinyScrollContainer).data("plugin_tinyscrollbar");

            if (todayFinal == reftodayFinal) {
                containerTimeline.update(scrollTo = position-180);
            } else if (queryStringOrigin === 'previous') {
                containerTimeline.update(10882);
            } else if (queryStringOrigin === 'next') {
                containerTimeline.update(0);
            } else {
                if (todayFinal > reftodayFinal) {
                    containerTimeline.update(10882);
                } else if (todayFinal < reftodayFinal) {
                    containerTimeline.update(0);
                }
            }

        },

        checkIfEventIsStillLive: function(today) {
            var self = this;
            var tags = $(".program-row span");
            var indexOfLiveProgram = false;

            tags.each(function( index ) {
                var slot = $(this);
                var timestart = slot.attr("timestart");
                var timeend = slot.attr("timeend");

                if (indexOfLiveProgram) {
                    slot.addClass('nextlivenow');
                    indexOfLiveProgram = false;
                }
                indexOfLiveProgram = self.addOnNow(slot, timestart, timeend, today, index);
            });
        },

        toPreviousNextDay: function(action, today) {
            var self = this;
            var action = action;
            var url = String(location.href);
            var date = today;
            var urlNew;
            var varAmount = 0;

            if (action === 'next') {
                var newDate = new Date(date.setDate(date.getDate() + 1));
            } else {
                var newDate = new Date(date.setDate(date.getDate() - 1));
            }

            var varAmount = url.indexOf('?');
            var finalDate = self.formatDate(newDate);

            if (varAmount > 0) {
                var urlSubstringPos = url.indexOf('?date=');

                if (urlSubstringPos > 0) {
                    finalDate = '?date=' + finalDate;
                    urlNew = url.slice(0, urlSubstringPos);
                    urlNew = urlNew + finalDate;
                } else {
                    var urlSubstringPosDate = url.indexOf('&date=');
                    if (urlSubstringPosDate > 0) {
                        finalDate = '&date=' + finalDate;
                        urlNew = url.slice(0, urlSubstringPosDate);
                        urlNew = urlNew + finalDate;
                    } else {
                        finalDate = '&date=' + finalDate;
                        urlNew = url + finalDate;
                    }
                }
                location.href=urlNew+'&origin='+action;
            } else {
                finalDate = '?date=' + finalDate;
                urlNew = url + finalDate;
                location.href=urlNew+'&origin='+action;
            }
        },

        resetGridHeight: function() {
            var self = this;
            var gridHeight = $('.grid-programs').height();
//            $('.epg-grid').height(gridHeight);
            $('.viewport').height(gridHeight);
        },

        buildProgramDetails: function(programid) {
            var self = this;
            var channelId = programid.split('-');
            var container = $('.program-details');
            var containerLive = $('.program-details.' + programid);
            var slot = $('.program-slot');
            var slotLive = $('.program-slot.' + programid);
            var icon = $('.channel-icon');
            var iconLive = $('.channel-icon.' + channelId[0]);

            container.hide();
            container.removeClass('opened');
            slot.removeClass('selected');
            icon.removeClass('selected');

            containerLive.show();
            containerLive.addClass('opened');
            slotLive.addClass('selected');
            iconLive.addClass('selected');

            self.centerProgramDetails();
            self.resetGridHeight();
        },

        centerProgramDetails: function() {
            var self = this;
            var containerLive = $('.program-details.opened');
            var position = $('.grid-programs').position();
            var left = Math.abs(position.left);

            containerLive.css('left', left + 'px');
        },

        closeProgramDetails: function(programid) {
            var self = this;
            var container = $('.program-details');
            var containerLive = $('.program-details.opened');
            var icon = $('.channel-icon');

            container.hide();
            icon.removeClass('selected');
            $('.program-slot').removeClass('selected');
            containerLive.removeClass('opened');
            self.resetGridHeight();
        },

        datePicker: function(request_date) {
            var self = this;
            var url = String(location.href);
            var varAmount = 0;
            var varAmount = url.indexOf('?');
            var finalDate = self.formatDate(request_date);
            var urlNew;

            if (varAmount > 0) {
                var urlSubstringPos = url.indexOf('?date=');

                if (urlSubstringPos > 0) {
                    finalDate = '?date=' + finalDate;
                    urlNew = url.slice(0, urlSubstringPos);
                    urlNew = urlNew + finalDate;
                } else {
                    var urlSubstringPosDate = url.indexOf('&date=');
                    if (urlSubstringPosDate > 0) {
                        finalDate = '&date=' + finalDate;
                        urlNew = url.slice(0, urlSubstringPosDate);
                        urlNew = urlNew + finalDate;
                    } else {
                        finalDate = '&date=' + finalDate;
                        urlNew = url + finalDate;
                    }
                }
                location.href=urlNew;
            } else {
                finalDate = '?date=' + finalDate;
                urlNew = url + finalDate;
                location.href=urlNew;
            }
        },

        getQueryString: function () {
            var self = this;
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = pair[1];
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [ query_string[pair[0]], pair[1] ];
                    query_string[pair[0]] = arr;
                } else {
                    query_string[pair[0]].push(pair[1]);
                }
            }
            return query_string;
        },

        formatDate: function (date) {
            var self = this;
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        },

        //Tell us if this event is on or not
        isItOn: function (start, end) {
            var self = this;
            var startTimeStamp = parseInt(start);
            var endTimeStamp = parseInt(end);
            var currentTimeInt = parseInt(self.getCurrentTime());

            if ((currentTimeInt >= startTimeStamp) && (currentTimeInt <= endTimeStamp)) {
                return true;
            }
        }

    });
})(jQuery, window, document);