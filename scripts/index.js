// to Do
//x/ on category click, maked  get request and load the JSON with promise,
//x return the  data, then load the  dom TemplateStringsArray
//x looop the json and put first question, and its answers

//get request for the API
var getQuestionsData = (function() {
    function getData(url) {
        var getDataPromise = new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = getRequest;
            xhr.open('GET', url, true);
            xhr.onerror = function(e) {
                console.log.error(xhr.statusText);
            };
            xhr.send(null);

            function getRequest(e) {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (xhr.responseText === 'Not found') {
                        reject(Error('broke'));
                        console.error(xhr.statusText);
                    } else {
                        //console.log(xhr.responseText);
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

var injectQuestions = (function() {
    //cache DOM
    var categoriesContainer = document.querySelector('.main-screen__categories'),
        categoriesUl = document.querySelector('.main-screen__categories-container'),
        questionsArticle = document.querySelector('.questions'),
        questionDOM = document.querySelector('.questions__question'),
        answersDOM = document.querySelectorAll('.questions__answers'),
        btnNext = document.querySelector('.btn__next'),
        questionSection = document.querySelector('.questions-container--hidden-js'),
        questionTitle = document.querySelector('.questions__title'),
        scoreSection = document.querySelector('.score-section'),
        totalQuestions = document.querySelector('.score-section__score__total'),
        finalScore = document.querySelector('.score-section__score__val'),
        finalScoreCategory = document.querySelector('.score-section__category'),
        btnBackHome = document.querySelector('.btn__back-home'),
        categoryTitle,
        count = 0,
        correctCounter = 0,
        answersJSON,
        question;
    console.log(question);
    //event Listeners
    categoriesUl.addEventListener('click', loadQuestion, false);
    btnNext.addEventListener('click', nextQuestion, false);
    questionsArticle.addEventListener('click', checkAnswer, false);
    btnBackHome.addEventListener('click', backToHome, false);

    //functions
    //load questions from JSON file
    function loadQuestion(e) {
        e.preventDefault();
        var target = e.target,
            url;
        if (!target.classList.contains('btn__select-category')) {
            return;
        }
        //get the url for the JSON file
        categoryTitle = target.textContent;
        url = 'api/' + categoryTitle + '.json';

        //check if question continter is hidden
        if (questionSection.classList.contains('questions-container--hidden-js')) {
            questionSection.classList.remove('questions-container--hidden-js');
            questionSection.classList.add('questions-container--visible-js');
        }

        questionTitle.textContent = categoryTitle;
        categoriesContainer.classList.add('main-screen__categories--hide-js');

        getQuestionsData.getData(url)
            .then(function(data) {
                question = data.nature.slice();
                return question;
            }).then(showQuestion);

    }

    function showQuestion() {
        question.forEach(function(element, index) {
            var questionData = element.question,
                answersData = element.answers;
            if (index !== count) {
                return;
            }

            //append  the JSON data to the HTML;
            questionDOM.textContent = questionData;
            answersJSON = answersData;
            //append answers to listItems;
            answersData.forEach(function(element, index) {
                if (answersData.length === answersDOM.length) {
                    answersDOM[index].textContent = element.answer;

                }
            });

            //add total count of questions to the counter
            document.querySelector('.questions__total-count').textContent = question.length;
            document.querySelector('.questions__current-count').textContent = index + 1;
            return;

        }, this);
    }

    function nextQuestion(e) {
        e.preventDefault();
        count += 1;
        if (count >= question.length) {
            showEndScore();
            return;
        }
        showQuestion();
        checkIfHighlighted();

        this.classList.add('btn__next--hidden-js');

    }

    //clear  previously selected Answers
    function checkIfHighlighted() {
        answersDOM.forEach(function(element, index) {
            if (element.classList.contains('questions__answers--wrong-js')) {
                element.classList.remove('questions__answers--wrong-js');
            }

            if (element.classList.contains('questions__answers--correct-js')) {
                element.classList.remove('questions__answers--correct-js');
            }
        });
    }
    //show the final score after completion of the test
    function showEndScore() {
        //hide question bar
        questionSection.classList.add('.hide-to-left-js');
        questionSection.classList.add('questions-container--hidden-js');

        //show Final score panel
        scoreSection.classList.remove('hidden-js');
        finalScore.textContent = correctCounter;
        finalScoreCategory.textContent = categoryTitle;
        totalQuestions.textContent = question.length;
    }

    //check if answer is correct
    function checkAnswer(e) {
        var target = e.target,
            selectedAnswer;
        if (target.className !== 'questions__answers') {
            return;
        }
        // check if element contains class wrong or correct
        for (var element of answersDOM) {
            if (element.classList.contains('questions__answers--correct-js') || element.classList.contains('questions__answers--wrong-js')) {
                return;
            }

        };

        selectedAnswer = target.textContent;
        answersJSON.forEach(function(element) {
            var answersData = element.answer,
                answerState = element.valid,
                answerCorrect;

            //store the value of the correct answer
            if (element.valid === true) {
                answerCorrect = element.answer;

                for (var element of answersDOM) {
                    if (element.textContent === answerCorrect) {
                        element.classList.add('questions__answers--correct-js');
                    }
                }
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
        scoreSection.classList.add('hide-to-left-js');
        scoreSection.classList.add('hidden-js');

        //show Main screen
        categoriesContainer.classList.remove('main-screen__categories--hide-js');
        question = undefined;
        count = 0;
        correctCounter = 0;
        answersDOM.textContent = '';
        checkIfHighlighted();
        scoreSection.classList.remove('hide-to-left-js');
    }
})();
