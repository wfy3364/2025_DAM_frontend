// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
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
    let csvDataStorage = []; // 存储CSV上传的独立数据

    // 切换输入方式按钮事件
    toggleBtn.addEventListener('click', () => {
        // 切换容器显示状态（通过d-none类）
        tableInputContainer.classList.toggle('d-none');
        csvInputContainer.classList.toggle('d-none');
        // 更新按钮文本
        toggleBtn.textContent = tableInputContainer.classList.contains('d-none') 
            ? '使用表格输入' 
            : '使用CSV上传';
    });
    
    // 添加新行
    addRowBtn.addEventListener('click', function() {
        const tbody = inputTable.querySelector('tbody');
        const newRow = document.createElement('tr');
        
        newRow.innerHTML = `
            <td><input type="checkbox" class="row-select"></td>
            <td>
                <select>
                    <option value="">--选择--</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </td>
            <td><input type="number" step="0.1" min="0" placeholder="例如: 45.2"></td>
            <td>
                <select>
                    <option value="">--选择--</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                </select>
            </td>
            <td>
                <select>
                    <option value="">--选择--</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                </select>
            </td>
            <td><input type="text" placeholder="例如: current"></td>
            <td><input type="number" step="0.1" min="0" placeholder="例如: 28.3"></td>
            <td><input type="number" step="0.1" min="0" placeholder="例如: 6.5"></td>
            <td><input type="number" min="0" placeholder="例如: 150"></td>
        `;
        
        tbody.appendChild(newRow);
    });
    
    // 删除选中行
    deleteRowBtn.addEventListener('click', function() {
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
        
        // 更新全选状态
        selectAllCheckbox.checked = false;
    });
    
    // 全选/取消全选
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = inputTable.querySelectorAll('.row-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });
    
    // CSV文件上传处理
    csvUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const csvData = event.target.result;

                // 解析数据（跳过表头，存储到独立变量）
                csvDataStorage = csvData.split('\n').slice(1).map(row => {
                    const cols = row.split(',');
                    return {
                        gender: cols[0],
                        age: cols[1],
                        hypertension: cols[2],
                        heart_disease: cols[3],
                        smoking_history: cols[4],
                        bmi: cols[5],
                        HbA1c_level: cols[6],
                        blood_glucose_level: cols[7]
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
    
    // 提交数据到后端
    submitBtn.addEventListener('click', function() {
        let data = [];
        let isValid = true;

        // 判断当前输入方式（表格或CSV）
        const isUsingCSV = csvInputContainer.classList.contains('d-none') === false;

        if (isUsingCSV) {
            // CSV上传方式：使用独立存储的数据
            if (csvDataStorage.length === 0) {
                inputStatus.textContent = "请先上传有效的CSV文件";
                inputStatus.className = "status-bar status-error";
                return;
            }
            data = csvDataStorage;
        } else {
            // 表格输入方式：从表格收集数据
            const rows = inputTable.querySelectorAll('tbody tr');
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.querySelectorAll('td');
                    
                const gender = cells[1].querySelector('select').value;
                const age = cells[2].querySelector('input').value;
                const hypertension = cells[3].querySelector('select').value;
                const heartDisease = cells[4].querySelector('select').value;
                const smokingHistory = cells[5].querySelector('input').value;
                const bmi = cells[6].querySelector('input').value;
                const hba1c = cells[7].querySelector('input').value;
                const bloodGlucose = cells[8].querySelector('input').value;
                
                // 验证数据
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

        // 提交数据到后端（原有模拟逻辑）
        inputStatus.textContent = "正在处理数据...";
        inputStatus.className = "status-bar";
        setTimeout(() => {
            const resultData = data.map(item => ({
                ...item,
                diabetes: Math.random() > 0.5 ? 1 : 0 // 模拟预测结果
            }));
            displayResults(resultData);
            inputStatus.textContent = `成功处理 ${data.length} 条数据`;
            inputStatus.className = "status-bar status-success";
        }, 1500);
    });
    
    // 显示结果
    function displayResults(data) {
        const tbody = resultTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        data.slice(0, 300).forEach(item => {
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
                <td style="font-weight: bold; color: ${item.diabetes === 1 ? '#e74c3c' : '#2ecc71'}">
                    ${item.diabetes}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // 显示结果区域
        resultSection.style.display = 'block';
        resultStatus.textContent = `共 ${data.length} 条预测结果，最多展示300条`;
        resultStatus.className = "status-bar status-success";
        
        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 下载CSV结果
    downloadCsvBtn.addEventListener('click', function() {
        const rows = resultTable.querySelectorAll('tbody tr');
        if (rows.length === 0) {
            resultStatus.textContent = "没有可下载的数据";
            resultStatus.className = "status-bar status-error";
            return;
        }
        
        // 创建CSV内容
        let csvContent = "性别,年龄,高血压,心脏病,吸烟史,BMI,HbA1c,血糖水平,糖尿病预测\n";
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            const rowData = [];
            
            cols.forEach((col, index) => {
                // 跳过最后一列的特殊样式
                const text = index === 8 ? col.textContent.trim() : col.textContent;
                rowData.push(text);
            });
            
            csvContent += rowData.join(',') + '\n';
        });
        
        // 创建下载链接
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