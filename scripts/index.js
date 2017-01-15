(function() {
    document.addEventListener('DOMContentLoaded', function(){
    //get request for the API
    var getQuestionsData = (function() {
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
                            reject(Error('broke'));
                            alert(xhr.statusText);
                        } else {
                            var response = JSON.parse(xhr.responseText);
                            resolve(response);
                        }
                    }
                };
            });

            return getDataPromise;
        }

        return {
            getData: getData
        }
    })();
    //function for chaining dom Classes add, remove, toggle
    var chainCl = (function() {
        function chainCl(e) {
            var elClass = e.classList
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
            }
        }
        return chainCl
    })();
    var injectQuestions = (function() {
        //cache DOM
        var categoriesContainer = document.querySelector('.main-screen__categories'),
            questionSection = document.querySelector('.questions-container'),
            questionsArticle = questionSection.querySelector('.questions'),
            answersDOM = [].slice.call(questionsArticle.querySelectorAll('.questions__answers')),
            btnNext = questionsArticle.querySelector('.btn__next'),
            scoreSection = document.querySelector('.score-section'),            
            btnBackHome = scoreSection.querySelector('.btn__back-home'),
            count = 0,
            correctCounter = 0,  
            categoryTitle,
            answersJSON,
            question;

        //event Listeners        
        categoriesContainer.addEventListener('click', loadQuestion, false);
        btnNext.addEventListener('click', nextQuestion, false);
        questionsArticle.addEventListener('click', checkAnswer, false);
        btnBackHome.addEventListener('click', backToHome, false);

        //functions
        //load questions from JSON file
        function loadQuestion(e) {
            e.preventDefault();
            var target = e.target,
                questionTitle = questionSection.querySelector('.questions__title'),
                checkIsHidden, url;
            if (!target.classList.contains('btn__select-category')) {
                return;
            }
            //get the url for the JSON file
            categoryTitle = target.textContent;
            questionTitle.textContent = categoryTitle;
            url = 'api/' + categoryTitle + '.json';

            //check if contains .show-from-right class
            checkIsHidden = (function() {
                if (categoriesContainer.classList.contains('show-from-right-js')) {
                    chainCl(categoriesContainer).remove('show-from-right-js')
                        .add('hide-to-left-js');

                } else {
                    categoriesContainer.classList.add('hide-to-left-js');
                }
                //check if question continter is hidden
                if (questionSection.classList.contains('hide-to-left-js') || questionSection.classList.contains('hidden-js')) {
                    chainCl(questionSection).remove('hide-to-left-js')
                        .remove('hidden-js')
                        .add('show-from-right-js');
                }
            }());

            getQuestionsData.getData(url)
                .then(function(data) {
                    question = data.questions.slice();
                    return question;
                }).then(showQuestion);

        }
        //load  data
        function showQuestion() {
            var questionDOM = questionsArticle.querySelector('.questions__question'),
                loopQuestions;
            //set question counter values
            loopQuestions =  question.forEach(function(element, index) {
              var totalCount = questionsArticle.querySelector('.questions__total-count'),
                    curCount = questionsArticle.querySelector('.questions__current-count'),
                    questionData = element.question;
                if (index !== count) {
                    return;
                }

                //append  the question data to the HTML;
                questionDOM.textContent = questionData;
                answersJSON = element.answers;
                //append answers to HTML listItems;
                answersJSON.forEach(function(element, index) {
                    if (answersJSON.length === answersDOM.length) {
                        answersDOM[index].textContent = element.answer;
                    }
                });
                //add total count of questions to the counter
                totalCount.textContent = question.length;
                curCount.textContent = index + 1;
                return;
            });
        }
        //show next question on click
        function nextQuestion(e) {
            e.preventDefault();
            var finalScoreCategory = scoreSection.querySelector('.score-section__category'),
                totalQuestions = scoreSection.querySelector('.score-section__score__total'),
                finalScore = scoreSection.querySelector('.score-section__score__val');
         //if its the final question show final score
            if (count >= question.length-1) {
                showEndScore();
                return;
            }
               function showEndScore () {
                //hide question bar
                chainCl(questionSection).add('hide-to-left-js')
                    .remove('show-from-right-js');
                //show Final score panel
                chainCl(scoreSection).remove('hidden-js')
                    .remove('hide-to-left-js')
                    .add('show-from-right-js');
                finalScore.textContent = correctCounter;
                finalScoreCategory.textContent = categoryTitle;
                totalQuestions.textContent = question.length;
            }

            count += 1;
            showQuestion();
            checkIfHighlighted();
            this.classList.add('btn__next--hidden-js');

        }

        //clear  previously selected Answers
        function checkIfHighlighted() {
            answersDOM.forEach(function(element) {
                if (element.classList.contains('questions__answers--wrong-js')) {
                    element.classList.remove('questions__answers--wrong-js');
                }

                if (element.classList.contains('questions__answers--correct-js')) {
                    element.classList.remove('questions__answers--correct-js');
                }
            });
        }


        //check if answer is correct
        function checkAnswer(e) {
            var target = e.target,
                checkCorrectOrWrong,
                selectedAnswer;
            if (target.className !== 'questions__answers') {
                return;
            }
           
            checkCorrectOrWrong = answersDOM.every(function(element) {                    
                return  element.classList.contains('questions__answers--correct-js') 
                         || element.classList.contains('questions__answers--wrong-js') ? false : true;
                
            });
             // check if element contains class wrong or correct
            if(checkCorrectOrWrong == false){
                return;
            }
          

            selectedAnswer = target.textContent;
            answersJSON.forEach(function(element) {
                var answersData = element.answer,
                    answerState = element.valid,
                    answerCorrect, checkCorrect;

                //store the value of the correct answer
                if (answerState === true) {
                    answerCorrect = answersData;
                     checkCorrect = answersDOM.filter(function(el){
                            return el.textContent === answerCorrect;
                        });
                    checkCorrect[0].classList.add('questions__answers--correct-js');
                }
                //check if the answer is the correct
                if (selectedAnswer === answersData) {
                    if (answerState === true) {
                        target.classList.add('questions__answers--correct-js');
                        correctCounter += 1;
                    } else {
                        target.classList.add('questions__answers--wrong-js');
                    }
                    btnNext.classList.remove('btn__next--hidden-js');
                }
            });

        }

        //Function to go back to home page when test is finished
        function backToHome(e) {
            e.preventDefault();
            //hide score screen
            chainCl(scoreSection).add('hide-to-left-js')
                    .remove('show-from-right-js');
                      
            //show Main screen
           chainCl(categoriesContainer).remove('hide-to-left-js')
                .add('show-from-right-js');
            
        //clear everything
            question = undefined;
            count = 0;
            correctCounter = 0;
            answersDOM.textContent = '';
            checkIfHighlighted();
            btnNext.classList.add('btn__next--hidden-js');
        }
        })();
    });
})();
