(function() {
    //get request for the API
    var getTestData = (function() {
        function getData(url) {
            var getDataPromise = new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = getRequest;
                xhr.open('GET', url, true);
                xhr.onerror = function(e) {
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
        }

        return {
            getData: getData
        };
    }());
    //function for chaining dom Classes - add, remove, toggle
    var chainCl = (function() {
        function chainCl(e) {
            var elClass = e.classList;
            return {
                add: function(x) {
                    elClass.add(x);
                    return this;
                },
                remove: function(x) {
                    elClass.remove(x);
                    return this;
                },
                toggle: function(x) {
                    elClass.toggle(x);
                    return this;
                }
            };
        }
        return chainCl;
    }());

    var injectQuestions = (function() {
        //cache DOM
        var categoriesContainerElement = document.getElementById('categories-container');
        var finalScoreSection = document.getElementById('final-score');
        var btnBackHomeElement = finalScoreSection.querySelector('.btn__back-home');
        var testContainerElement = document.getElementById('test-container');
        var testHeadlineElement = testContainerElement.querySelector('.test__headline');
        var testQuestionContainerElement = testContainerElement.querySelector('.question-container');
        var testQuestionElement = testQuestionContainerElement.querySelector('.question');
        var testAnswersListElement = [].slice.call(testQuestionContainerElement.querySelectorAll('.answer'));
        var testNextButtonElement = testQuestionContainerElement.querySelector('.btn__next');
        var count = 0;
        var correctQuestionsCounter = 0;
        var categoryTitle;
        var getAnswersFromData;
        var questions;

        //functions

        //check container  if its hidden if not, hide it
        function checkContainerForHiddenStatus(categoryCont, testCont) {
            if (categoryCont.classList.contains('js-show-from-right')) {
                chainCl(categoryCont).remove('js-show-from-right').add('js-hide-to-left');

            } else {
                categoryCont.classList.add('js-hide-to-left');
            }
            //check if test continter is hidden
            if (testCont.classList.contains('js-hide-to-left') || testCont.classList.contains('js-hidden')) {
                chainCl(testCont).remove('js-hide-to-left').remove('js-hidden').add('js-show-from-right');
            }
        }
        //load questions
        function loadQuestion(e) {
            e.preventDefault();
            var target = e.target;
            var categoryTitle;
            var url;
            //check if the button is the clicked element
            if (!target.classList.contains('btn__select-category')) {
                return;
            }
            //create data url
            categoryTitle = target.textContent;
            url = 'api/' + categoryTitle + '.json';

            //load questions from JSON
            getTestData.getData(url).then(function(data) {
                questions = data.questions.slice();
                return questions;
            }).then(appendQustionDataToDom);

            //Hide Category container, show Test container, append test headline
            checkContainerForHiddenStatus(categoriesContainerElement, testContainerElement);
            testHeadlineElement.textContent = categoryTitle;
        }
        //Recursion for looping over  questions
        function iterateQuestions(start, end, array) {
            var element = questions[start];
            var getQuestionData = {};
            var answersLength;

            if (start !== count) {
                return iterateQuestions(start + 1, end, array);
            } else {
                getQuestionData.question = element.question;
                getQuestionData.answers = element.answers;
                getQuestionData.increaseQuestionsCount = start + 1;
                return getQuestionData;
            }
        }
        //Recurssion for looping over Answers
        function iterateAndApendAnswers(start, end, arrayOne, arrayTwo) {
            var element = arrayOne[start];
            if (start > end - 1) {
                return;
            }
            if (end === arrayTwo.length) {
                arrayTwo[start].textContent = element.answer;
            }
            return iterateAndApendAnswers(start + 1, end, arrayOne, arrayTwo);
        }
        //Append data from JSON to DOM elements
        function appendQustionDataToDom() {
            var currentQuestionsCountElement = testQuestionContainerElement.querySelector('.question-count__current');
            var totalQuestionsCountElement = testQuestionContainerElement.querySelector('.question-count__total');
            var questionsLength = questions.length;
            var answersLength;
            var currentQuestion;
            var loopQuestions;

            currentQuestion = iterateQuestions(0, questionsLength, questions);
            //append  the question data to the HTML;
            testQuestionElement.textContent = currentQuestion.question;
            getAnswersFromData = currentQuestion.answers;
            //set counter  values
            currentQuestionsCountElement.textContent = currentQuestion.increaseQuestionsCount;
            totalQuestionsCountElement.textContent = questionsLength;
            //loop answers and append them to the DOM elements
            answersLength = getAnswersFromData.length;
            iterateAndApendAnswers(0, answersLength, getAnswersFromData, testAnswersListElement);

        }

        //show next question on click
        function nextQuestion(e) {
            e.preventDefault();
            var answersElementLength = testAnswersListElement.length;
            var target = e.target;
            //if its the final question show final score
            if (count >= questions.length - 1) {
                showEndScore();
                return;
            }
            count += 1;
            appendQustionDataToDom();
            checkIfHighlighted(0, answersElementLength, testAnswersListElement);
            target.classList.add('js-btn__next--hidden');

        }
        //remove  question section and  show  final score
        function showEndScore() {
            var finalScoreCategoryElement = finalScoreSection.querySelector('.score-section__category');
            var finalScoreTotalElement = finalScoreSection.querySelector('.score-section__score__total');
            var finalScoreValueElement = finalScoreSection.querySelector('.score-section__score__val');
            //hide test
            chainCl(testContainerElement).add('js-hide-to-left').remove('js-show-from-right');
            //show Final score panel
            chainCl(finalScoreSection).remove('js-hidden').remove('js-hide-to-left').add('js-show-from-right');
            finalScoreValueElement.textContent = correctQuestionsCounter;
            finalScoreCategoryElement.textContent = testHeadlineElement.textContent;
            finalScoreTotalElement.textContent = questions.length;

        }
        //clear  previously selected Answers
        function checkIfHighlighted(start, end, array) {
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

            return checkIfHighlighted(start + 1, end, array);
        }

        //store the value of the correct answer
        function setCorrectAnswer(start, end, array) {
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
            return setCorrectAnswer(start + 1, end, array);
        }

        //check if answer is correct
        function checkAnswer(e) {
            var answersDataLength = getAnswersFromData.length;
            var target = e.target;
            var checkCorrectOrWrong;
            var correctAnswer;
            var getCorrectAnswer;
            var selectedAnswer;
            if (target.className !== 'answer') {
                return;
            }

            checkCorrectOrWrong = testAnswersListElement.every(function(element) {
                return element.classList.contains('js-answer--correct') || element.classList.contains('js-answer--wrong') ? false : true;

            });
            // check if element contains class wrong or correct
            if (checkCorrectOrWrong === false) {
                return;
            }

            selectedAnswer = target.textContent;

            correctAnswer = setCorrectAnswer(0, answersDataLength, getAnswersFromData);
            //check if the answer is the correct
            if (selectedAnswer === correctAnswer.getAnswer) {
                //if answer is  correct, add class correct and increast counter
                if (correctAnswer.getAnswerState === true) {
                    target.classList.add('js-answer--correct');
                    correctQuestionsCounter += 1;
                }
            } else { //if answer is wrong  add class wrong, find correct answer and add class correct
                target.classList.add('js-answer--wrong');
                getCorrectAnswer = testAnswersListElement.filter(function(el) {
                    return el.textContent === correctAnswer.getAnswer;
                });
                getCorrectAnswer[0].classList.add('js-answer--correct');
            }

            testNextButtonElement.classList.remove('js-btn__next--hidden');
        }

        //Function to go back to home page when test is finished
        function backToHome(e) {
            e.preventDefault();
            var answersLength = testAnswersListElement.length;
            //hide score screen
            chainCl(finalScoreSection).add('js-hide-to-left').remove('js-show-from-right');

            //show Main screen
            chainCl(categoriesContainerElement).remove('js-hide-to-left').add('js-show-from-right');

            //clear everything
            questions = undefined;
            count = 0;
            correctQuestionsCounter = 0;
            testAnswersListElement.textContent = '';
            checkIfHighlighted(0, answersLength, testAnswersListElement);
            testNextButtonElement.classList.add('js-btn__next--hidden');
        }

        //event Listeners
        document.addEventListener('DOMContentLoaded', function() {
            categoriesContainerElement.addEventListener('click', loadQuestion, false);
            testNextButtonElement.addEventListener('click', nextQuestion, false);
            testQuestionContainerElement.addEventListener('click', checkAnswer, false);
            btnBackHomeElement.addEventListener('click', backToHome, false);
        });
    }());
}());
