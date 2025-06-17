document.addEventListener('DOMContentLoaded', function () {
    const inputTable = document.getElementById('input-table');
    const resultTable = document.getElementById('result-table');
    const addRowBtn = document.getElementById('add-row');
    const deleteRowBtn = document.getElementById('delete-row');
    const selectAllCheckbox = document.getElementById('select-all');
    const csvUpload = document.getElementById('csv-upload');
    const submitBtn = document.getElementById('submit-data');
    const resultSection = document.getElementById('result-section');
    const downloadCsvBtn = document.getElementById('download-csv');
    const inputStatus = document.getElementById('input-status');
    const resultStatus = document.getElementById('result-status');
    const toggleBtn = document.getElementById('toggle-input-method');
    const tableInputContainer = document.querySelector('.table-input-container');
    const csvInputContainer = document.querySelector('.csv-input-container');
    let csvDataStorage = [];

    toggleBtn.addEventListener('click', () => {
        tableInputContainer.classList.toggle('d-none');
        csvInputContainer.classList.toggle('d-none');
        const isCsv = tableInputContainer.classList.contains('d-none');
        addRowBtn.style.display = isCsv ? 'none' : 'inline-block';
        deleteRowBtn.style.display = isCsv ? 'none' : 'inline-block';
        toggleBtn.textContent = isCsv ? '使用表格输入' : '使用CSV上传';
    });

    addRowBtn.addEventListener('click', function () {
        const tbody = inputTable.querySelector('tbody');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td><input type="checkbox" class="row-select"></td>
            <td>
                <select>
                    <option value="">--选择--</option>
                    <option value="Male">男</option>
                    <option value="Female">女</option>
                    <option value="Other">其他</option>
                </select>
            </td>
            <td><input type="number" step="0.01" min="0" placeholder="例如: 45.2"></td>
            <td>
                <select>
                    <option value="">--选择--</option>
                    <option value="0">否</option>
                    <option value="1">是</option>
                </select>
            </td>
            <td>
                <select>
                    <option value="">--选择--</option>
                    <option value="0">否</option>
                    <option value="1">是</option>
                </select>
            </td>
            <td>
                <select>
                    <option value="">--选择--</option>
                    <option value="current">current</option>
                    <option value="former">former</option>
                    <option value="not current">not current</option>
                    <option value="never">never</option>
                    <option value="ever">ever</option>
                    <option value="No Info">No Info</option>
                </select>
            </td>
            <td><input type="number" step="0.01" min="0" placeholder="例如: 28.30"></td>
            <td><input type="number" step="0.01" min="0" placeholder="例如: 6.50"></td>
            <td><input type="number" min="0" placeholder="例如: 150"></td>
        `;
        tbody.appendChild(newRow);
    });

    deleteRowBtn.addEventListener('click', function () {
        const rows = inputTable.querySelectorAll('tbody tr');
        let deleted = false;
        for (let i = rows.length - 1; i >= 0; i--) {
            const checkbox = rows[i].querySelector('.row-select');
            if (checkbox.checked) {
                rows[i].remove();
                deleted = true;
            }
        }
        if (!deleted) {
            inputStatus.textContent = "请选择要删除的行";
            inputStatus.className = "status-bar status-error";
            setTimeout(() => {
                inputStatus.textContent = "";
                inputStatus.className = "status-bar";
            }, 3000);
        }
        selectAllCheckbox.checked = false;
    });

    selectAllCheckbox.addEventListener('change', function () {
        const checkboxes = inputTable.querySelectorAll('.row-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    csvUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const csvData = event.target.result;
                csvDataStorage = csvData.split('\n').slice(1).map(row => {
                    const cols = row.split(',');
                    return {
                        gender: cols[0],
                        age: parseFloat(parseFloat(cols[1]).toFixed(2)),
                        hypertension: parseInt(cols[2]),
                        heart_disease: parseInt(cols[3]),
                        smoking_history: cols[4],
                        bmi: parseFloat(parseFloat(cols[5]).toFixed(2)),
                        HbA1c_level: parseFloat(parseFloat(cols[6]).toFixed(2)),
                        blood_glucose_level: parseInt(cols[7])
                    };
                });
                inputStatus.textContent = `成功导入 ${csvDataStorage.length} 条CSV数据`;
                inputStatus.className = "status-bar status-success";
            } catch (error) {
                inputStatus.textContent = "CSV文件解析错误: " + error.message;
                inputStatus.className = "status-bar status-error";
            }
        };
        reader.readAsText(file);
    });

    submitBtn.addEventListener('click', function () {
        let data = [];
        let isValid = true;
        const isUsingCSV = csvInputContainer.classList.contains('d-none') === false;

        if (isUsingCSV) {
            if (csvDataStorage.length === 0) {
                inputStatus.textContent = "请先上传有效的CSV文件";
                inputStatus.className = "status-bar status-error";
                return;
            }
            data = csvDataStorage;
        } else {
            const rows = inputTable.querySelectorAll('tbody tr');
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.querySelectorAll('td');
                const gender = cells[1].querySelector('select').value;
                const age = cells[2].querySelector('input').value;
                const hypertension = cells[3].querySelector('select').value;
                const heartDisease = cells[4].querySelector('select').value;
                const smokingHistory = cells[5].querySelector('select').value;
                const bmi = cells[6].querySelector('input').value;
                const hba1c = cells[7].querySelector('input').value;
                const bloodGlucose = cells[8].querySelector('input').value;

                if (!gender || !age || !hypertension || !heartDisease || !smokingHistory || !bmi || !hba1c || !bloodGlucose) {
                    isValid = false;
                    row.style.backgroundColor = '#fff0f0';
                    continue;
                }

                row.style.backgroundColor = '';
                data.push({
                    gender,
                    age: parseFloat(age),
                    hypertension: parseInt(hypertension),
                    heart_disease: parseInt(heartDisease),
                    smoking_history: smokingHistory,
                    bmi: parseFloat(bmi),
                    HbA1c_level: parseFloat(hba1c),
                    blood_glucose_level: parseInt(bloodGlucose)
                });
            }
            if (!isValid || data.length === 0) {
                inputStatus.textContent = "请确保所有表格字段都已填写且有效";
                inputStatus.className = "status-bar status-error";
                return;
            }
        }

        inputStatus.textContent = "正在处理数据...";
        inputStatus.className = "status-bar";

        fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
       .then(response => response.json())
       .then(data => {
            if (data.error) {
                inputStatus.textContent = "服务器错误: " + data.error;
                inputStatus.className = "status-bar status-error";
                return;
            }
            const resultData = data.map(item => {
                const NAFLD_score = sigmoid((item.HbA1c_level - 5.5) / 1.0);
                const MetS_hits = [
                    item.bmi >= 30,
                    item.hypertension === 1,
                    item.blood_glucose_level >= 100,
                    item.HbA1c_level >= 5.7
                ];
                const MetS_score = MetS_hits.filter(Boolean).length / 4;

                let MetS_level = '低';
                if (MetS_score === 1) MetS_level = '极高';
                else if (MetS_score >= 0.75) MetS_level = '高';
                else if (MetS_score >= 0.5) MetS_level = '中';

                return { ...item, diabetes, NAFLD_score, MetS_score, MetS_hits, MetS_level };
            });

            displayResults(resultData);
            displayResults(data);
            inputStatus.textContent = `成功处理 ${data.length} 条数据`;
            inputStatus.className = "status-bar status-success";
        })
        .catch(error => {
            inputStatus.textContent = "服务器错误: " + error.message;
            inputStatus.className = "status-bar status-error";
        });
    });

    function sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    function displayResults(data) {
        const tbody = resultTable.querySelector('tbody');
        tbody.innerHTML = '';
        data.slice(0, 300).forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.gender}</td>
                <td>${item.age}</td>
                <td>${item.hypertension}</td>
                <td>${item.heart_disease}</td>
                <td>${item.smoking_history}</td>
                <td>${item.bmi}</td>
                <td>${item.HbA1c_level}</td>
                <td>${item.blood_glucose_level}</td>
                <td style="font-weight: bold; color: ${item.diabetes === 1 ? '#e74c3c' : '#2ecc71'}">${item.diabetes}</td>
                <td title="HbA1c >= 5.5 时脂肪肝风险上升">${(item.NAFLD_score * 100).toFixed(1)}%</td>
                <td title="命中 ${item.MetS_hits.filter(Boolean).length} 项：${['BMI>=30', '高血压', '血糖>=100', 'HbA1c>=5.7'].filter((_, i) => item.MetS_hits[i]).join('，')}">${item.MetS_level}</td>
                <td><button class="btn btn-secondary" onclick="showHealthReport(${index})">分析</button></td>
            `;
            tbody.appendChild(row);
        });

        resultSection.style.display = 'block';
        resultStatus.textContent = `共 ${data.length} 条预测结果，最多展示300条`;
        resultStatus.className = "status-bar status-success";
        resultSection.scrollIntoView({ behavior: 'smooth' });

        window.latestResults = data;
    }

    window.showHealthReport = function (index) {
        const item = window.latestResults[index];
        alert(`【健康分析报告】\n` +
            `年龄：${item.age}，性别：${item.gender}\n` +
            `糖尿病预测：${item.diabetes ? '是' : '否'}\n` +
            `脂肪肝风险：${(item.NAFLD_score * 100).toFixed(1)}%，代谢风险等级：${item.MetS_level}\n` +
            `BMI: ${item.bmi}，HbA1c: ${item.HbA1c_level}，血糖: ${item.blood_glucose_level}`);
    };

    downloadCsvBtn.addEventListener('click', function () {
        const rows = resultTable.querySelectorAll('tbody tr');
        if (rows.length === 0) {
            resultStatus.textContent = "没有可下载的数据";
            resultStatus.className = "status-bar status-error";
            return;
        }

        let csvContent = "性别,年龄,高血压,心脏病,吸烟史,BMI,HbA1c,血糖水平,糖尿病预测,NAFLD风险,MetS等级\n";
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            const rowData = [];
            cols.forEach(col => {
                rowData.push(col.textContent.trim());
            });
            csvContent += rowData.join(',') + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `diabetes_prediction_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        resultStatus.textContent = "CSV文件下载成功";
        resultStatus.className = "status-bar status-success";
    });
});
