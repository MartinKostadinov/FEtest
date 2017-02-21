(function () {
    //function for chaining dom Classes - add, remove, toggle
    var chainCl = (function () {
        function chainCl(e) {
            var elClass = e.classList;
            return {
                add: function (x) {
                    elClass.add(x);
                    return this;
                },
                remove: function (x) {
                    elClass.remove(x);
                    return this;
                },
                toggle: function (x) {
                    elClass.toggle(x);
                    return this;
                }
            };
        }
        return chainCl;
    }());
     /** 
     * homeView
    */
    var homeView = {
        init: function () {
            this.categoriesContainerElement = document.getElementById('categories-container');
            this.testContainerElement = document.getElementById('test-container');
            this.testQuestionContainerElement = this.testContainerElement.querySelector('.question-container');
            this.correctQuestionsCountElement = this.testQuestionContainerElement.querySelector('.question-count__current');
            this.testQuestionElement = this.testQuestionContainerElement.querySelector('.question');
            this.totalQuestionsCountElement = this.testQuestionContainerElement.querySelector('.question-count__total');
            this.testAnswersListElement = [].slice.call(this.testQuestionContainerElement.querySelectorAll('.answer'));
            this.testHeadlineElement = this.testContainerElement.querySelector('.test__headline');
            this.render();
        },
        render: function () {
            this.categoriesContainerElement.addEventListener('click', this.showTest, false);
        },
        showTest: function (e) {
            e.preventDefault();
            var target = e.target;
            var categoryTitle, url;
            //check if the button is the clicked element
            if (!target.classList.contains('btn__select-category')) {
                return;
            }
            //create data url
            categoryTitle = target.textContent;
            url = 'api/' + categoryTitle + '.json';
            //get Test data
            controller.getTestData(url).then(function () {
                var currentQuestion;
                currentQuestion = controller.getCurrentQuestion();
                controller.setCurrentAnswers(currentQuestion.answers);
                //append  the test data to the HTML;
                homeView.testQuestionElement.textContent = currentQuestion.question;
                homeView.answersData = currentQuestion.answers;
                //set counter  values
                homeView.correctQuestionsCountElement.textContent = currentQuestion.increaseQuestionsCount;
                homeView.totalQuestionsCountElement.textContent = controller.getTestLenght();
                //loop answers and append them to the DOM elements
                homeView.answersLength = homeView.answersData.length;
                controller.iterateAndApendAnswers(0, homeView.answersLength, homeView.answersData, homeView.testAnswersListElement);
                //Hide Category container, show Test container, append test headline
                homeView.checkContainerForHiddenStatus(homeView.categoriesContainerElement, homeView.testContainerElement);
                homeView.testHeadlineElement.textContent = categoryTitle;
            });
        },
        checkContainerForHiddenStatus: function (categoryCont, testCont) {
            if (categoryCont.classList.contains('js-show-from-right')) {
                chainCl(categoryCont).remove('js-show-from-right').add('js-hide-to-left');

            } else {
                categoryCont.classList.add('js-hide-to-left');
            }
            //check if test containter is hidden
            if (testCont.classList.contains('js-hide-to-left') || testCont.classList.contains('js-hidden')) {
                chainCl(testCont).remove('js-hide-to-left').remove('js-hidden').add('js-show-from-right');
            }
        }
    };
/** 
 * testView
*/
    var testView = {
        init: function () {
            this.finalScoreSection = document.getElementById('final-score');
            this.finalScoreCategoryElement = this.finalScoreSection.querySelector('.score-section__category');
            this.finalScoreTotalElement = this.finalScoreSection.querySelector('.score-section__score__total');
            this.finalScoreValueElement = this.finalScoreSection.querySelector('.score-section__score__val');
            this.testNextButtonElement = homeView.testQuestionContainerElement.querySelector('.btn__next');
            this.correctQuestionsCountElement = homeView.testQuestionContainerElement.querySelector('.question-count__current');
            this.totalQuestionsCountElement = homeView.testQuestionContainerElement.querySelector('.question-count__total');
            this.btnBackHomeElement = this.finalScoreSection.querySelector('.btn__back-home');
            this.render();
        },
        render: function () {
            //Check if selected answer is correct or wrong
            homeView.testQuestionContainerElement.addEventListener('click', testView.checkCorrectAnswer, false);
            //Go to next question
            testView.testNextButtonElement.addEventListener('click', testView.showNextQuestion, false);
            //Hide final score and return to home screen
            testView.btnBackHomeElement.addEventListener('click', this.backToHome, false);

        },
        checkCorrectAnswer: function (e) {
            var target = e.target;
            var getAnswersFromData = controller.getCurrentAnswers();
            var answersDataLength = getAnswersFromData.length;
            var checkCorrectOrWrong, correctAnswer, getCorrectAnswer, selectedAnswer, correctCount;

            if (target.className !== 'answer') return;

            checkCorrectOrWrong = homeView.testAnswersListElement.every(function (element) {
                return element.classList.contains('js-answer--correct') || element.classList.contains('js-answer--wrong') ? false : true;
            });
            // check if element contains class wrong or correct
            if (checkCorrectOrWrong === false) return;

            selectedAnswer = target.textContent;
            correctAnswer = controller.setCorrectAnswer(0, answersDataLength, getAnswersFromData);
            correctCount = controller.getCorrectCounter();

            //check if the answer is the correct
            if (selectedAnswer === correctAnswer.getAnswer) {
                //if answer is  correct, add class correct and increast counter
                if (correctAnswer.getAnswerState === true) {
                    target.classList.add('js-answer--correct');
                    controller.setCorrectCounter(correctCount + 1);
                }
            } else { //if answer is wrong  add class wrong, find correct answer and add class correct
                target.classList.add('js-answer--wrong');
                getCorrectAnswer = homeView.testAnswersListElement.filter(function (el) {
                    //console.log(el,correctAnswer.getAnswer);
                    return el.textContent === correctAnswer.getAnswer;
                });
                getCorrectAnswer[0].classList.add('js-answer--correct');
            }

            testView.testNextButtonElement.classList.remove('js-btn__next--hidden');
        },
        showNextQuestion: function (e) {
            e.preventDefault();
            var answersElementLength = homeView.testAnswersListElement.length;
            var target = e.target;
            var count = controller.getCount();
            var testLenght = controller.getTestLenght();
            //if its the final question show final score
            if (count >= testLenght - 1) {
                testView.showEndScore();
                return;
            }
            count += 1;
            controller.setCount(count);
            testView.appendQustionDataToDom();
            testView.checkIfHighlighted(0, answersElementLength, homeView.testAnswersListElement);
            target.classList.add('js-btn__next--hidden');
        },
        backToHome: function (e) {
            e.preventDefault();
            var answersLength = homeView.testAnswersListElement.length;
            //hide score screen
            chainCl(testView.finalScoreSection).add('js-hide-to-left').remove('js-show-from-right');

            //show Main screen
            chainCl(homeView.categoriesContainerElement).remove('js-hide-to-left').add('js-show-from-right');

            //clear everything
            controller.setTestsInitialValue();
            controller.setCount(0);
            controller.setCorrectCounter(0);
            homeView.testAnswersListElement.textContent = '';
            testView.checkIfHighlighted(0, answersLength, homeView.testAnswersListElement);
            testView.testNextButtonElement.classList.add('js-btn__next--hidden');
        },
        showEndScore: function () {
            //hide test
            chainCl(homeView.testContainerElement).add('js-hide-to-left').remove('js-show-from-right');
            //show Final score panel
            chainCl(this.finalScoreSection).remove('js-hidden').remove('js-hide-to-left').add('js-show-from-right');
            this.finalScoreValueElement.textContent = controller.getCorrectCounter();
            this.finalScoreCategoryElement.textContent = homeView.testHeadlineElement.textContent;
            this.finalScoreTotalElement.textContent = controller.getTestLenght();
        },
        appendQustionDataToDom: function () {
            var questionsLength = controller.getTestLenght();
            var answersLength;
            var getAnswersFromData;
            var currentQuestion;
            var loopQuestions;

            currentQuestion = controller.getCurrentQuestion();
            //append  the question data to the HTML;
            homeView.testQuestionElement.textContent = currentQuestion.question;
            getAnswersFromData = currentQuestion.answers;/////////////////
            controller.setCurrentAnswers(getAnswersFromData);
            //set counter  values
            testView.correctQuestionsCountElement.textContent = currentQuestion.increaseQuestionsCount;
            testView.totalQuestionsCountElement.textContent = questionsLength;
            //loop answers and append them to the DOM elements
            answersLength = getAnswersFromData.length;
            controller.iterateAndApendAnswers(0, answersLength, getAnswersFromData, homeView.testAnswersListElement);
        },
        checkIfHighlighted: function (start, end, array) {
            var element = array[start];

            if (start >= end) {
                return;
            }

            if (element.classList.contains('js-answer--wrong')) {
                element.classList.remove('js-answer--wrong');
            }

            if (element.classList.contains('js-answer--correct')) {
                element.classList.remove('js-answer--correct');
            }

            return this.checkIfHighlighted(start + 1, end, array);
        }
    };
    /** 
     * CONTROLLER
    */
    var controller = {
        getRequest: function (url) {
            var getDataPromise = new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = getRequest;
                xhr.open('GET', url, true);
                xhr.onerror = function (e) {
                    alert(xhr.statusText);
                };
                xhr.send(null);

                function getRequest(e) {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        if (xhr.responseText === 'Not found') {
                            reject(Error('Not Found, contanct admin'));
                            alert(xhr.statusText);
                        } else {
                            var response = JSON.parse(xhr.responseText);
                            resolve(response);
                        }
                    }
                }
            });

            return getDataPromise;
        },
        getTestData: function (url) {
            return this.getRequest(url).then(function (data) {
                model.questions = data.questions.slice();
                return model.questions;
            });
        },
        setTestsInitialValue: function () {
            model.questions = null;
        },
        getTestLenght: function () {
            return model.questions.length;
        },
        setCurrentAnswers: function (answers) {
            var currentQuestion = this.getCurrentQuestion();
            model.currentAnswers = answers;
        },
        getCurrentAnswers: function () {
            return model.currentAnswers;
        },
        setCurrentQuestion: function () {
            model.currentQuestion = this.iterateTest(0, this.getTestLenght, model.questions);
        },
        getCurrentQuestion: function () {
            this.setCurrentQuestion();
            return model.currentQuestion;
        },
        setCorrectCounter: function (count) {
            model.correctQuestionsCounter = count;
        },
        getCorrectCounter: function () {
            return model.correctQuestionsCounter;
        },
        setCount: function (value) {
            model.count = value;
        },
        getCount: function () {
            return model.count;
        },
        iterateTest: function (start, end, array) {
            var element = model.questions[start];
            var getQuestionData = {};
            var answersLength;

            if (start !== model.count) {
                return this.iterateTest(start + 1, end, array);
            } else {
                getQuestionData.question = element.question;
                getQuestionData.answers = element.answers;
                getQuestionData.increaseQuestionsCount = start + 1;
                return getQuestionData;
            }
        },
        iterateAndApendAnswers: function (start, end, arrayOne, arrayTwo) {
            var element = arrayOne[start];
            if (start > end - 1) {
                return;
            }
            if (end === arrayTwo.length) {
                arrayTwo[start].textContent = element.answer;
            }
            return this.iterateAndApendAnswers(start + 1, end, arrayOne, arrayTwo);
        },
        setCorrectAnswer: function (start, end, array) {
            var element = array[start];
            var getAnswer = element.answer;
            var getAnswerState = element.valid;
            var correctAnswerValue;

            //check for valid answer and  store it to the dom
            if (getAnswerState === true) {
                correctAnswerValue = getAnswer;
                return {
                    getAnswer: correctAnswerValue,
                    getAnswerState: getAnswerState
                };
            }
            return this.setCorrectAnswer(start + 1, end, array);
        },
        init: function () {
            homeView.init();
            testView.init();
        }
    };
     /** 
     * Model
    */
    var model = {
        questions: null,
        currentQuestion: null,
        currentAnswers: null,
        correctQuestionsCounter: 0,
        count: 0
    };
    document.addEventListener('DOMContentLoaded', function () {
        controller.init();
    });

}());
