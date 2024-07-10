$(document).ready(function() {
    openMainPage();
    loadArticlesFromStorage();

    function openMainPage() {
        $('.main-content').hide();
        $('#main-page').show();
    }

    function openPage(pageName) {
        $('.main-content').hide();
        $('#' + pageName).show();
    }

    function execCmd(command, value = null) {
        document.execCommand(command, false, value);
    }

    function saveArticle() {
        var title = $('#article-title').val().trim();
        if (title === '') {
            alert('Makale adı giriniz.');
            return;
        }
        
        var content = $('#editor').html();
        var firstChar = title.charAt(0).toUpperCase();
        
        if (!/^[A-Z0-9]$/.test(firstChar)) {
            alert('Makale adı geçersiz. (A-Z ve 0-9 arası olmalı)');
            return;
        }
        
        var articleId = firstChar + '-' + title.replace(/\s+/g, '-');
        
        if ($('#' + articleId).length) {
            alert('Bu makale adı zaten mevcut.');
            return;
        }

        var article = {
            id: articleId,
            title: title,
            content: content,
            firstChar: firstChar
        };
        
        var articles = getArticlesFromStorage();
        articles.push(article);
        saveArticlesToStorage(articles);
        loadArticlesForChar(firstChar);
        
        $('#editor').html('');
        $('#article-title').val('');
        alert('Makale kaydedildi.');
    }

    function openSubPage(id) {
        $('.sub-content').hide();
        $('#' + id).show();
    }

    function deleteArticle(id, title) {
        if (confirm('Makaleyi silmek istediğinize emin misiniz?')) {
            $('#' + id).remove();
            $('#tab-' + id).remove();
            
            var articles = getArticlesFromStorage();
            articles = articles.filter(article => article.id !== id);
            saveArticlesToStorage(articles);
            loadArticlesForChar(title.charAt(0).toUpperCase());

            alert('Makale silindi.');
        }
    }

    function getArticlesFromStorage() {
        var articles = localStorage.getItem('articles');
        return articles ? JSON.parse(articles) : [];
    }

    function saveArticlesToStorage(articles) {
        localStorage.setItem('articles', JSON.stringify(articles));
    }

    function loadArticlesFromStorage() {
        var articles = getArticlesFromStorage();
        var groupedArticles = groupArticlesByFirstChar(articles);

        for (var char in groupedArticles) {
            if (groupedArticles.hasOwnProperty(char)) {
                loadArticlesForChar(char, groupedArticles[char]);
            }
        }
    }

    function groupArticlesByFirstChar(articles) {
        var grouped = {};
        
        articles.forEach(article => {
            var char = article.firstChar;
            if (!grouped[char]) {
                grouped[char] = [];
            }
            grouped[char].push(article);
        });
        
        return grouped;
    }

    function loadArticlesForChar(char, articles) {
        if (!articles) {
            articles = getArticlesFromStorage().filter(article => article.firstChar === char);
        }
        
        articles.sort((a, b) => a.title.localeCompare(b.title));
        
        $('#' + char + ' .side-tabs').html('');
        articles.forEach(article => {
            var articleTab = `
                <div class="sub-tab" id="tab-${article.id}" onclick="openSubPage('${article.id}')">${article.title}</div>
                <div id="${article.id}" class="sub-content">
                    ${article.content}
                    <button onclick="deleteArticle('${article.id}', '${article.title}')">Makale Sil</button>
                </div>
            `;
            $('#' + char + ' .side-tabs').append(articleTab);
        });
    }

    // Function bindings
    window.openMainPage = openMainPage;
    window.openPage = openPage;
    window.execCmd = execCmd;
    window.saveArticle = saveArticle;
    window.openSubPage = openSubPage;
    window.deleteArticle = deleteArticle;
});