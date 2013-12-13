(function () {
    angular.module('validation', ['validation.provider', 'validation.directive']);
}).call(this);
(function () {
    angular.module('validation.provider', [])
        .provider('validationProvider', function () {

            /**
             * true if the form is true, else false
             * @type {{}}
             */
            var valid = {};


            /**
             * Define validation type RegExp
             * @type {{required: RegExp, url: RegExp, email: RegExp}}
             */
            var expression = {
                required: /.+/gi,
                url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
                email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                number: /^\d+$/
            };


            /**
             * default error, success message
             * @type {{required: {error: string, success: string}, url: {error: string, success: string}}}
             */
            var defaultMsg = {
                required: {
                    error: 'This should be Required!!',
                    success: 'It\'s Required'
                },
                url: {
                    error: 'This should be Url',
                    success: 'It\'s Url'
                },
                email: {
                    error: 'This should be Email',
                    success: 'It\'s Email'
                },
                number: {
                    error: 'This should be Number',
                    success: 'It\'s Number'
                }
            };

            /**
             * Allow user to set default message
             * @param obj
             */
            var setupDefaultMsg = function (obj) {
                angular.extend(defaultMsg, obj);
            };

            /**
             * Error message HTML, here's the default
             * @param message
             * @returns {string}
             */
            var errorHTML = function (message) {
                return '<p class="error">' + message + '</p>';
            };


            /**
             * Success message HTML, here's the default
             * @param message
             * @returns {string}
             */
            var successHTML = function (message) {
                return '<p class="success">' + message + '</p>';
            };


            /**
             * $get
             * @returns {{valid: {}, defaultMsg: {required: {error: string, success: string}, url: {error: string, success: string}}, errorHTML: Function, successHTML: Function}}
             */
            this.$get = function () {
                return {
                    valid: valid,
                    expression: expression,
                    defaultMsg: defaultMsg,
                    errorHTML: errorHTML,
                    successHTML: successHTML,
                    setupDefaultMsg: setupDefaultMsg
                }
            };


        });
}).call(this);
(function () {
    angular.module('validation.directive', ['validation.provider'])
        .directive('validator', ['validationProvider', function ($validationProvider) {

            /**
             * Do this function iff validation valid
             * @param element
             * @param validMessage
             * @param validation
             * @param callback
             */
            var validFunc = function (element, validMessage, validation, callback) {
                element.next().remove();
                element.after($validationProvider.successHTML(validMessage || $validationProvider.defaultMsg[validation].success));
                $validationProvider.valid[validation] = true;
                if (callback) callback();
            };


            /**
             * Do this function iff validation invalid
             * @param element
             * @param validMessage
             * @param validation
             */
            var invalidFunc = function (element, validMessage, validation, callback) {
                element.next().remove();
                element.after($validationProvider.errorHTML(validMessage || $validationProvider.defaultMsg[validation].error));
                $validationProvider.valid[validation] = false;
                if (callback) callback();
            };


            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    validCallback: '&',
                    invalidCallback: '&'
                },
                link: function (scope, element, attrs, ctrl) {
                    /**
                     * validator
                     * @type {*|Array}
                     *
                     * Convert user input String to Array
                     */
                    var validator = attrs.validator.split(',');

                    /**
                     * Valid/Invalid Message
                     */
                    element.after('<span></span>');

                    /**
                     * Check Every validator
                     */
                    validator.forEach(function (validation) {
                        var successMessage = validation + 'SuccessMessage',
                            errorMessage = validation + 'ErrorMessage';

                        /**
                         * Set Validity to false when Initial
                         */
                        ctrl.$setValidity(ctrl.$name, false);

                        scope.$watch('model', function (value) {

                            /**
                             * dirty, pristine, viewValue control here
                             */
                            if (ctrl.$pristine && ctrl.$viewValue) {
                            }
                            else if (ctrl.$pristine) {
                                return;
                            }

                            if ($validationProvider.expression[validation].test(value)) {
                                validFunc(element, attrs[successMessage], validation, scope.validCallback());
                                ctrl.$setValidity(ctrl.$name, true);
                            } else {
                                invalidFunc(element, attrs[errorMessage], validation, scope.invalidCallback());
                                ctrl.$setValidity(ctrl.$name, false);
                            }
                        });


                    });
                }
            }
        }]);
}).call(this);