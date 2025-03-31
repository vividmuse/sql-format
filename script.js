// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const sqlInput = document.getElementById('sql-input');
    const sqlOutput = document.getElementById('sql-output');
    const formatBtn = document.getElementById('format-btn');
    const compressBtn = document.getElementById('compress-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const dialectSelect = document.getElementById('dialect-select'); // Keep for formatter
    const copyFeedback = document.getElementById('copy-feedback');

    // Ensure libraries are loaded
    if (typeof sqlFormatter === 'undefined' || typeof hljs === 'undefined') {
        console.error("Error: Required libraries (sql-formatter, highlight.js) not loaded.");
        alert("页面加载失败，请检查网络连接或稍后重试。");
        // Disable buttons if libraries fail
        formatBtn.disabled = true;
        compressBtn.disabled = true;
        copyBtn.disabled = true;
        clearBtn.disabled = true;
        return;
    }

    // --- Formatting Function (using sql-formatter) ---
    const formatSql = () => {
        const sql = sqlInput.value.trim();
        const dialect = dialectSelect.value;
        copyFeedback.textContent = '';

        if (!sql) {
            sqlOutput.textContent = '';
            sqlOutput.classList.remove('hljs');
            return;
        }

        try {
            const formattedSql = sqlFormatter.format(sql, {
                language: dialect,
                tabWidth: 2,          // Standard indentation
                keywordCase: 'upper', // Uppercase keywords
                linesBetweenQueries: 1 // Blank line between queries
            });

            sqlOutput.textContent = formattedSql;
            hljs.highlightElement(sqlOutput);

        } catch (error) {
            console.error("SQL Formatting Error:", error);
            sqlOutput.textContent = `格式化出错：\n${error.message}\n\n请检查您的 SQL 语法或选择正确的方言。`;
            sqlOutput.classList.remove('hljs');
        }
    };

    // --- Advanced Compression Function (Regex-based) ---
    const compressSqlAdvanced = (sql) => {
        if (!sql) return '';

        let compressed = sql;

        // 1. Remove Block Comments (/* ... */) - Handles multiline comments
        compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '');

        // 2. Remove Line Comments (-- ...)
        compressed = compressed.replace(/--.*$/gm, '');

        // 3. Replace all forms of whitespace (newline, tab, multiple spaces) with a single space
        compressed = compressed.replace(/[\s\r\n\t]+/g, ' ');

        // 4. Process SQL keywords to ensure proper spacing
        const keywords = [
            'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
            'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
            'INNER JOIN', 'OUTER JOIN', 'ON', 'AS', 'DISTINCT', 'UNION', 'UNION ALL',
            'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
            'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW', 'DROP VIEW', 'CREATE DATABASE',
            'DROP DATABASE', 'USE', 'SHOW', 'DESCRIBE', 'DESC', 'GRANT', 'REVOKE',
            'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'SET', 'VALUES', 'DEFAULT', 'NULL',
            'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK', 'CONSTRAINT', 'REFERENCES',
            'CASCADE', 'RESTRICT', 'SET NULL', 'NO ACTION', 'ASC', 'DESC'
        ];

        // Sort keywords by length (longest first) to handle compound keywords correctly
        keywords.sort((a, b) => b.length - a.length);

        // Add spaces around keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            compressed = compressed.replace(regex, ` ${keyword} `);
        });

        // 5. Remove whitespace around specific punctuation/operators where it's usually safe
        compressed = compressed.replace(/\s*([,;=<>+\-*/%&|^~!()])\s*/g, '$1');

        // 6. Remove leading/trailing whitespace and normalize multiple spaces
        compressed = compressed.trim().replace(/\s+/g, ' ');

        return compressed;
    }

    // --- Compression Action ---
    const performCompression = () => {
        const sql = sqlInput.value; // Get raw value including leading/trailing spaces initially
        copyFeedback.textContent = '';

        if (!sql.trim()) { // Check if it's empty after trimming
            sqlOutput.textContent = '';
            sqlOutput.classList.remove('hljs');
            return;
        }

        try {
            // Use the new advanced compression function
            const compressedSql = compressSqlAdvanced(sql);

            sqlOutput.textContent = compressedSql;
            // Apply syntax highlighting AFTER setting text content
            hljs.highlightElement(sqlOutput);

        } catch (error) {
            // Basic regex shouldn't throw errors like the formatter, but include for safety
            console.error("SQL Compression Error:", error);
            sqlOutput.textContent = `压缩时发生意外错误：\n${error.message}`;
            sqlOutput.classList.remove('hljs');
        }
    };


    // --- Clipboard and Clear Functions (Keep as before) ---
    const copyToClipboard = () => {
        const textToCopy = sqlOutput.textContent;
        copyFeedback.textContent = ''; // Clear previous feedback

        if (!textToCopy) {
            copyFeedback.textContent = '没有内容可以复制';
            copyFeedback.style.color = 'orange';
            setTimeout(() => copyFeedback.textContent = '', 2000);
            return;
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyBtn.textContent = '已复制!';
                copyBtn.style.backgroundColor = '#27ae60'; // Green confirmation
                copyFeedback.textContent = '结果已成功复制到剪贴板！';
                copyFeedback.style.color = 'green';

                setTimeout(() => {
                    copyBtn.textContent = '复制';
                    copyBtn.style.backgroundColor = '#2ecc71'; // Original green
                     copyFeedback.textContent = '';
                }, 2000);
            })
            .catch(err => {
                console.error('无法复制文本: ', err);
                copyFeedback.textContent = '复制失败! 请检查浏览器权限。';
                copyFeedback.style.color = 'red';
                 setTimeout(() => copyFeedback.textContent = '', 3000);
            });
    };

    const clearFields = () => {
        sqlInput.value = '';
        sqlOutput.textContent = '';
        sqlOutput.classList.remove('hljs'); // Remove syntax highlighting class
        copyFeedback.textContent = ''; // Clear feedback
        sqlInput.focus(); // Set focus back to input
    };

    // --- Event Listeners ---
    formatBtn.addEventListener('click', formatSql); // Use the dedicated format function
    compressBtn.addEventListener('click', performCompression); // Use the dedicated compress function
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearFields);

    // Optional: Re-format when dialect changes if output exists and was formatted
    // dialectSelect.addEventListener('change', () => {
    //    if (sqlOutput.textContent && !compressBtn.disabled) { // Check if output has content potentially
    //       // Decide if you want to auto-reformat on dialect change
    //       // formatSql(); // Uncomment to enable auto-reformat
    //    }
    // });

    // Initial highlight configuration (if needed, usually hljs.highlightElement is enough)
    // hljs.configure({ languages: ['sql'] });
});

// 选项卡切换功能
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 添加当前活动状态
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab') + '-tab'; // 添加 -tab 后缀
            document.getElementById(targetId).classList.add('active');
        });
    });
});

// Diff 功能实现
function compareSQL() {
    const text1 = document.getElementById('diff-input-1').value;
    const text2 = document.getElementById('diff-input-2').value;
    const diffOutput = document.getElementById('diff-output');

    // 使用逐字符对比算法
    const diff = diffChars(text1, text2);
    
    // 生成带高亮的 HTML
    let html = '';
    
    // 添加切换按钮
    html += '<div class="diff-toggle">';
    html += '<button class="toggle-btn active" data-view="text">文本对比</button>';
    html += '<button class="toggle-btn" data-view="hex">十六进制对比</button>';
    html += '</div>';

    // 文本对比视图
    html += '<div class="diff-view text-view active">';
    html += '<div class="diff-columns">';
    
    // 文本对比第一列（原始文本）
    html += '<div class="diff-column">';
    html += '<div class="diff-header">原始文本</div>';
    
    // 处理原始文本
    let text1Html = '';
    diff.forEach(change => {
        if (!change.added) { // 显示原始文本中的内容（未改变或被删除的部分）
            const value = escapeHtml(change.value);
            if (change.removed) {
                text1Html += `<span class="diff-remove">${value}</span>`;
            } else {
                text1Html += `<span class="diff-unchanged">${value}</span>`;
            }
        }
    });

    // 按行分割并添加行号
    const lines1 = text1Html.split('\n');
    lines1.forEach((line, index) => {
        if (line || index < lines1.length - 1) { // 如果不是最后一个空行
            html += `<div class="diff-line">
                <span class="line-number">${index + 1}</span>
                <div class="diff-content">${line}</div>
            </div>`;
        }
    });
    html += '</div>';

    // 文本对比第二列（对比文本）
    html += '<div class="diff-column">';
    html += '<div class="diff-header">对比文本</div>';
    
    // 处理对比文本
    let text2Html = '';
    diff.forEach(change => {
        if (!change.removed) { // 显示对比文本中的内容（未改变或新增的部分）
            const value = escapeHtml(change.value);
            if (change.added) {
                text2Html += `<span class="diff-add">${value}</span>`;
            } else {
                text2Html += `<span class="diff-unchanged">${value}</span>`;
            }
        }
    });

    // 按行分割并添加行号
    const lines2 = text2Html.split('\n');
    lines2.forEach((line, index) => {
        if (line || index < lines2.length - 1) { // 如果不是最后一个空行
            html += `<div class="diff-line">
                <span class="line-number">${index + 1}</span>
                <div class="diff-content">${line}</div>
            </div>`;
        }
    });
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // 十六进制对比视图
    html += '<div class="diff-view hex-view">';
    html += '<div class="diff-columns">';
    
    // 十六进制对比第一列（原始文本）
    html += '<div class="diff-column">';
    html += '<div class="diff-header">原始文本(十六进制)</div>';
    
    // 处理原始文本的十六进制显示
    let hex1Html = '';
    diff.forEach(change => {
        if (!change.added) {
            const hexValue = textToHex(change.value);
            if (change.removed) {
                hex1Html += `<span class="diff-remove">${hexValue}</span>`;
            } else {
                hex1Html += `<span class="diff-unchanged">${hexValue}</span>`;
            }
        }
    });

    // 按行分割并添加行号
    const hexLines1 = hex1Html.split('\n');
    hexLines1.forEach((line, index) => {
        if (line || index < hexLines1.length - 1) {
            html += `<div class="diff-line">
                <span class="line-number">${index + 1}</span>
                <div class="hex-content">${line}</div>
            </div>`;
        }
    });
    html += '</div>';

    // 十六进制对比第二列（对比文本）
    html += '<div class="diff-column">';
    html += '<div class="diff-header">对比文本(十六进制)</div>';
    
    // 处理对比文本的十六进制显示
    let hex2Html = '';
    diff.forEach(change => {
        if (!change.removed) {
            const hexValue = textToHex(change.value);
            if (change.added) {
                hex2Html += `<span class="diff-add">${hexValue}</span>`;
            } else {
                hex2Html += `<span class="diff-unchanged">${hexValue}</span>`;
            }
        }
    });

    // 按行分割并添加行号
    const hexLines2 = hex2Html.split('\n');
    hexLines2.forEach((line, index) => {
        if (line || index < hexLines2.length - 1) {
            html += `<div class="diff-line">
                <span class="line-number">${index + 1}</span>
                <div class="hex-content">${line}</div>
            </div>`;
        }
    });
    html += '</div>';
    html += '</div>';
    html += '</div>';

    diffOutput.innerHTML = html;

    // 添加切换按钮事件监听
    const toggleBtns = diffOutput.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const views = diffOutput.querySelectorAll('.diff-view');
            views.forEach(v => v.classList.remove('active'));
            diffOutput.querySelector(`.${view}-view`).classList.add('active');
        });
    });
}

// HTML 转义函数
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 逐字符对比算法
function diffChars(oldStr, newStr) {
    // 找到最长公共子序列的长度和路径
    function computeLCS(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
        const path = Array(m + 1).fill().map(() => Array(n + 1).fill(''));

        // 填充动态规划表
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    path[i][j] = 'diagonal';
                } else {
                    if (dp[i - 1][j] >= dp[i][j - 1]) {
                        dp[i][j] = dp[i - 1][j];
                        path[i][j] = 'up';
                    } else {
                        dp[i][j] = dp[i][j - 1];
                        path[i][j] = 'left';
                    }
                }
            }
        }
        return { dp, path };
    }

    // 找到所有可能的匹配点
    function findMatchPoints(str1, str2) {
        const matches = [];
        let i = 0;
        while (i < str1.length) {
            let bestMatch = { start1: i, start2: -1, length: 0 };
            for (let j = 0; j < str2.length; j++) {
                let length = 0;
                while (i + length < str1.length && 
                       j + length < str2.length && 
                       str1[i + length] === str2[j + length]) {
                    length++;
                }
                if (length > bestMatch.length) {
                    bestMatch = { start1: i, start2: j, length };
                }
            }
            if (bestMatch.length > 0) {
                matches.push(bestMatch);
                i += bestMatch.length;
            } else {
                i++;
            }
        }
        return matches;
    }

    // 选择最优的匹配组合
    function selectBestMatches(matches, str1Length, str2Length) {
        // 按照匹配长度排序
        matches.sort((a, b) => b.length - a.length);
        
        const selected = [];
        const used1 = new Set();
        const used2 = new Set();

        for (const match of matches) {
            // 检查是否与已选择的匹配有重叠
            let hasOverlap = false;
            for (let i = 0; i < match.length; i++) {
                if (used1.has(match.start1 + i) || used2.has(match.start2 + i)) {
                    hasOverlap = true;
                    break;
                }
            }

            if (!hasOverlap) {
                selected.push(match);
                for (let i = 0; i < match.length; i++) {
                    used1.add(match.start1 + i);
                    used2.add(match.start2 + i);
                }
            }
        }

        // 按照原始位置排序
        selected.sort((a, b) => a.start1 - b.start1);
        return selected;
    }

    // 生成最终的差异结果
    const matches = findMatchPoints(oldStr, newStr);
    const bestMatches = selectBestMatches(matches, oldStr.length, newStr.length);
    
    const changes = [];
    let lastPos1 = 0;
    let lastPos2 = 0;

    for (const match of bestMatches) {
        // 添加删除的部分
        if (match.start1 > lastPos1) {
            changes.push({
                value: oldStr.slice(lastPos1, match.start1),
                removed: true
            });
        }
        // 添加新增的部分
        if (match.start2 > lastPos2) {
            changes.push({
                value: newStr.slice(lastPos2, match.start2),
                added: true
            });
        }
        // 添加相同的部分
        changes.push({
            value: oldStr.slice(match.start1, match.start1 + match.length),
            unchanged: true
        });
        lastPos1 = match.start1 + match.length;
        lastPos2 = match.start2 + match.length;
    }

    // 处理剩余部分
    if (lastPos1 < oldStr.length) {
        changes.push({
            value: oldStr.slice(lastPos1),
            removed: true
        });
    }
    if (lastPos2 < newStr.length) {
        changes.push({
            value: newStr.slice(lastPos2),
            added: true
        });
    }

    return changes;
}

// 复制 diff 结果
function copyDiffResult() {
    const diffOutput = document.getElementById('diff-output');
    const text = diffOutput.innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板！');
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制。');
    });
}

// 清空 diff 输入
function clearDiffInputs() {
    document.getElementById('diff-input-1').value = '';
    document.getElementById('diff-input-2').value = '';
    document.getElementById('diff-output').innerHTML = '';
}

// 添加 diff 功能的事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 获取 diff 相关的按钮元素
    const diffBtn = document.getElementById('diff-btn');
    const diffCopyBtn = document.getElementById('diff-copy-btn');
    const diffClearBtn = document.getElementById('diff-clear-btn');

    // 添加事件监听器
    if (diffBtn) {
        diffBtn.addEventListener('click', compareSQL);
    }
    if (diffCopyBtn) {
        diffCopyBtn.addEventListener('click', copyDiffResult);
    }
    if (diffClearBtn) {
        diffClearBtn.addEventListener('click', clearDiffInputs);
    }
});

// 文本转十六进制函数
function textToHex(text) {
    return Array.from(text).map(char => {
        const hex = char.charCodeAt(0).toString(16).padStart(2, '0');
        return `<span class="hex-char">${hex}</span>`;
    }).join(' ');
}