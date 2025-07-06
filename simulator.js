document.addEventListener('DOMContentLoaded', function() {
    // 获取所有DOM元素
    const baseAttackInput = document.getElementById('baseAttack');
    const baseBonusInput = document.getElementById('baseBonusPercent');
    const totalPointsInput = document.getElementById('totalPoints');
    const strengthSlider = document.getElementById('strengthSlider');
    const strengthValue = document.getElementById('strengthValue');
    const intSlider = document.getElementById('intelligenceSlider');
    const intValue = document.getElementById('intelligenceValue');
    const currentAttackEl = document.getElementById('currentAttack');
    const optimalStrengthEl = document.getElementById('optimalStrength');
    const optimalIntelligenceEl = document.getElementById('optimalIntelligence');
    const maxAttackEl = document.getElementById('maxAttack');
    const calculateOptimalBtn = document.getElementById('calculateOptimal');
    const classButtons = document.querySelectorAll('.class-btn');
    const formulaText = document.getElementById('formulaText');
    
    // 当前选择的职业
    let currentClass = 'warrior';
    
    // 职业配置
    const classConfig = {
        warrior: {
            name: '战士',
            formula: '最终攻击力 = (力/4+人物攻击力)*(200+智/10)%',
            calculateAttack: function(baseAttack, baseBonus, strength, intelligence) {
                return Math.round((strength / 4 + baseAttack) * (baseBonus + intelligence / 10) / 100);
            }
        },
        wizard: {
            name: '圣导师',
            formula: '最终攻击力 = (力/5+力/25+智/10+智/50+人物攻击力)*(200+智/20)%',
            calculateAttack: function(baseAttack, baseBonus, strength, intelligence) {
                return Math.round((strength / 5 + strength / 25 + intelligence / 10 + intelligence / 50 + baseAttack) * (baseBonus + intelligence / 20) / 100);
            }
        }
    };
    
    // 初始化
    updateAll();
    updateClassDisplay();
    
    // 设置事件监听器
    baseAttackInput.addEventListener('input', updateAll);
    baseBonusInput.addEventListener('input', updateAll);
    totalPointsInput.addEventListener('input', updateAll);
    strengthSlider.addEventListener('input', updateStrength);
    intSlider.addEventListener('input', updateIntelligence);
    calculateOptimalBtn.addEventListener('click', calculateOptimal);
    
    // 职业选择事件监听器
    classButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有active类
            classButtons.forEach(btn => btn.classList.remove('active'));
            // 添加active类到当前按钮
            this.classList.add('active');
            // 更新当前职业
            currentClass = this.dataset.class;
            // 更新显示
            updateClassDisplay();
            updateAll();
        });
    });
    
    // 更新职业显示
    function updateClassDisplay() {
        const config = classConfig[currentClass];
        formulaText.textContent = config.formula;
        document.title = `奇迹${config.name}加点模拟器`;
    }
    
    // 更新所有显示
    function updateAll() {
        const totalPoints = parseInt(totalPointsInput.value) || 0;
        
        // 更新滑块范围
        strengthSlider.max = totalPoints;
        intSlider.max = totalPoints;
        
        // 如果当前分配超过总点数，重新分配
        const currentStr = parseInt(strengthSlider.value) || 0;
        const currentInt = parseInt(intSlider.value) || 0;
        
        if (currentStr + currentInt > totalPoints) {
            const halfPoints = Math.floor(totalPoints / 2);
            strengthSlider.value = halfPoints;
            intSlider.value = totalPoints - halfPoints;
        }
        
        // 更新显示
        strengthValue.textContent = strengthSlider.value;
        intValue.textContent = intSlider.value;
        
        // 计算并显示攻击力
        updateAttackDisplay();
    }
    
    // 更新力量点数
    function updateStrength() {
        const totalPoints = parseInt(totalPointsInput.value) || 0;
        const strength = parseInt(strengthSlider.value) || 0;
        
        // 确保点数不超过总量
        if (strength > totalPoints) {
            strengthSlider.value = totalPoints;
            strengthValue.textContent = totalPoints;
            intSlider.value = 0;
            intValue.textContent = 0;
        } else {
            strengthValue.textContent = strength;
            const remainingPoints = totalPoints - strength;
            intSlider.value = remainingPoints;
            intValue.textContent = remainingPoints;
        }
        
        // 计算并显示攻击力
        updateAttackDisplay();
    }
    
    // 更新智力点数
    function updateIntelligence() {
        const totalPoints = parseInt(totalPointsInput.value) || 0;
        const intelligence = parseInt(intSlider.value) || 0;
        
        // 确保点数不超过总量
        if (intelligence > totalPoints) {
            intSlider.value = totalPoints;
            intValue.textContent = totalPoints;
            strengthSlider.value = 0;
            strengthValue.textContent = 0;
        } else {
            intValue.textContent = intelligence;
            const remainingPoints = totalPoints - intelligence;
            strengthSlider.value = remainingPoints;
            strengthValue.textContent = remainingPoints;
        }
        
        // 计算并显示攻击力
        updateAttackDisplay();
    }
    
    // 计算并显示攻击力
    function updateAttackDisplay() {
        const baseAttack = parseInt(baseAttackInput.value) || 0;
        const baseBonus = parseInt(baseBonusInput.value) || 0;
        const strength = parseInt(strengthSlider.value) || 0;
        const intelligence = parseInt(intSlider.value) || 0;
        
        // 计算当前职业攻击力
        const currentAttack = classConfig[currentClass].calculateAttack(baseAttack, baseBonus, strength, intelligence);
        currentAttackEl.textContent = currentAttack;
    }
    
    // 计算最优分配
    function calculateOptimal() {
        const baseAttack = parseInt(baseAttackInput.value) || 0;
        const baseBonus = parseInt(baseBonusInput.value) || 0;
        const totalPoints = parseInt(totalPointsInput.value) || 0;
        
        // 如果点数不足，直接返回
        if (totalPoints <= 0) {
            optimalStrengthEl.textContent = '0';
            optimalIntelligenceEl.textContent = '0';
            maxAttackEl.textContent = '0';
            return;
        }
        
        // 初始化变量
        let maxAttack = 0;
        let optimalStrength = 0;
        let optimalIntelligence = 0;
        
        // 添加进度提示
        calculateOptimalBtn.textContent = '计算中...';
        calculateOptimalBtn.disabled = true;
        
        // 使用setTimeout避免阻塞UI
        setTimeout(() => {
            // 遍历所有可能的分配方案
            for (let strength = 0; strength <= totalPoints; strength++) {
                const intelligence = totalPoints - strength;
                const attack = classConfig[currentClass].calculateAttack(baseAttack, baseBonus, strength, intelligence);
                
                // 更新最大值
                if (attack > maxAttack) {
                    maxAttack = attack;
                    optimalStrength = strength;
                    optimalIntelligence = intelligence;
                }
            }
            
            // 更新滑块和显示
            strengthSlider.value = optimalStrength;
            intSlider.value = optimalIntelligence;
            strengthValue.textContent = optimalStrength;
            intValue.textContent = optimalIntelligence;
            
            // 更新结果
            optimalStrengthEl.textContent = optimalStrength;
            optimalIntelligenceEl.textContent = optimalIntelligence;
            maxAttackEl.textContent = maxAttack;
            
            // 重新计算攻击力显示
            updateAttackDisplay();
            
            // 恢复按钮
            calculateOptimalBtn.textContent = '🚀 计算最优分配';
            calculateOptimalBtn.disabled = false;
            
            // 添加成功动画效果
            const resultsEl = document.querySelector('.results');
            resultsEl.style.animation = 'none';
            setTimeout(() => {
                resultsEl.style.animation = 'slideInRight 0.6s ease-out';
            }, 10);
            
        }, 100);
    }
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            calculateOptimal();
        }
        if (e.key === '1') {
            classButtons[0].click();
        }
        if (e.key === '2') {
            classButtons[1].click();
        }
    });
    
    // 添加数据导出功能
    window.exportData = function() {
        const data = {
            职业: classConfig[currentClass].name,
            基础攻击力: baseAttackInput.value,
            基础攻击加成: baseBonusInput.value + '%',
            总属性点: totalPointsInput.value,
            力量点数: strengthSlider.value,
            智力点数: intSlider.value,
            当前攻击力: currentAttackEl.textContent,
            计算时间: new Date().toLocaleString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `奇迹MU加点配置_${classConfig[currentClass].name}_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };
    
    // 添加右键菜单支持（导出数据）
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (confirm('是否导出当前配置数据？')) {
            exportData();
        }
    });
    
    // 添加提示工具
    const tooltips = {
        baseAttack: '角色的基础物理攻击力数值',
        baseBonusPercent: '技能或装备提供的攻击力百分比加成',
        totalPoints: '可用于分配的属性点总数',
        strengthSlider: '分配给力量属性的点数，影响物理攻击',
        intelligenceSlider: '分配给智力属性的点数，影响魔法攻击和攻击加成'
    };
    
    // 为输入元素添加提示
    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });
});
