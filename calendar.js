'use strict';

(function(angular){

    var cal = angular.module('rrCalendar', []);
    cal.controller('CalendarController', ['$scope','$attrs','calendarConfig','dateFilter', calendarCtrl]);
    cal.directive('eventCalendar', ['$parse', calendarImpl ]);
    cal.directive('monthCalendar', ['dateFilter', monthImpl ]);
    cal.directive('weekCalendar', ['dateFilter', weekImpl ]);
    cal.directive('dayCalendar', ['$parse', dayImpl ]);
    
    cal.constant('calendarConfig',{
        formatDay: 'dd',
        formatWeekDay: 'dd MMM',
        calendarMode: 'week',
        formatMonthTitle: 'MMMM yyyy',
        startingDay: 0
    });

    function calendarCtrl($scope, $attrs, calendarConfig, dateFilter) {
        var self = this,
            ngModelCtrl = { $setViewValue: angular.noop };
        angular.forEach(['formatDay','formatWeekDay','calendarMode','startingDay','formatMonthTitle'], function(key, index){
            self[key] = calendarConfig[key];
        });
        $scope.calendarMode = $scope.calendarMode || calendarConfig.calendarMode;
        this.activeDate = new Date();
        
        this.refreshView = function() {
            if ( this.element ) {
                this._refreshView();
            }
        };
        
        $scope.title = "";
        
        $scope.toggleMode = function( mode ) {
            $scope.calendarMode = mode;
        };
        
        $scope.move = function( direction ) {
            //self.activeDate = new Date(new Date(self.activeDate).setMonth(self.activeDate.getMonth()+direction));
            self.activeDate = self._move(direction);
            self.refreshView();
        };
        
        this.createDateObject = function(date, format) {
            var model = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
            return {
                date: date,
                label: dateFilter(date, format),
                disabled: this.isDisabled(date)
                //selected: model && this.compare(date, model) === 0,
                //current: this.compare(date, new Date()) === 0,
                //customClass: this.customClass(date)
            };
        };
        
        this.split = function(arr, size) {
            var arrays = [];
            while (arr.length > 0) {
                arrays.push(arr.splice(0, size));
            }
            return arrays;
        };
        
        this.isDisabled = function( d ){
            if(self.activeDate.getMonth() != d.getMonth()) return true;
            return false;
        }
        
        self.refreshView();
    }

    function calendarImpl($parse) {
        return {
            restrict: 'E',
            templateUrl: 'calendar.html',
            controller: "CalendarController",
            link: function (scope, element, attrs, ctrl) {

            }
        }
    }

    function monthImpl(dateFilter) {
        return {
            restrict: 'E',
            templateUrl: 'month.html',
            require: '^eventCalendar',
            link: function (scope, element, attrs, ctrl) {
                
                ctrl.element = element;
                
                var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                
                function getDaysInMonth( year, month ) {
                    return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
                }
                
                ctrl._refreshView = function(){
                    var year = ctrl.activeDate.getFullYear(),
                        month = ctrl.activeDate.getMonth(),
                        firstDayOfMonth = new Date(year, month, 1),
                        difference = ctrl.startingDay - firstDayOfMonth.getDay(),
                        numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : - difference,
                        firstDate = new Date(firstDayOfMonth);
                    
                    if ( numDisplayedFromPreviousMonth > 0 ) {
                        firstDate.setDate( - numDisplayedFromPreviousMonth + 1 );
                    }
                    
                    var days = getDates(firstDate, 42);
                    for (var i = 0; i < 42; i ++) {
                        days[i] = ctrl.createDateObject(days[i], ctrl.formatDay);
                    }
                    scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
                    scope.rows = ctrl.split(days, 7);
                }
        
                ctrl._move = function( direction ) {
                    return new Date(new Date(ctrl.activeDate).setMonth(ctrl.activeDate.getMonth()+direction));                    
                };
                
                function getDates(startDate, n) {
                    var dates = new Array(n), current = new Date(startDate), i = 0;
                    current.setHours(12);
                    while ( i < n ) {
                        dates[i++] = new Date(current);
                        current.setDate( current.getDate() + 1 );
                    }
                    return dates;
                }
                
                ctrl._refreshView();
            }
        }
    }

    function weekImpl(dateFilter) {
        return {
            restrict: 'E',
            templateUrl: 'week.html',
            require: '^eventCalendar',
            link: function (scope, element, attrs, ctrl) {
                
                ctrl.element = element;
                var today;
                
                ctrl._refreshView = function() {
                    today = ctrl.activeDate;
                    var currentDate = ctrl.activeDate,
                        dayOfWeek = currentDate.getDay(),
                        diff = currentDate.getDate() - dayOfWeek,
                        weekStart = new Date(currentDate.setDate(diff)),
                        weekEnd = new Date(currentDate.setDate(weekStart.getDate() + 6));console.log(ctrl.activeDate);
                    var days = new Array(7);
                    scope.header = dateFilter(weekStart, ctrl.formatWeekDay) + ' - ';
                    scope.header += dateFilter(weekEnd, ctrl.formatWeekDay);
                    var i = 0;
                    while(i < 7) {
                        days[i++] = ctrl.createDateObject(new Date(weekStart), ctrl.formatWeekDay);;
                        weekStart.setDate( weekStart.getDate() + 1 );
                    }
                    scope.days = days;
                }
        
                ctrl._move = function( direction ) {
                    var d = new Date();
                    d.setDate( today.getDate() + (direction*7) );
                    return d;
                };
                
                ctrl._refreshView();
            }
        }
    }

    function dayImpl($parse) {
        return {
            restrict: 'E',
            templateUrl: 'day.html',
            link: function (scope, element, attrs, ctrl) {
            }
        }
    }
    
    cal.filter('monthName', [function() {
        return function (monthNumber) {
            var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
            return monthNames[monthNumber];
        }
    }]);

})(angular);