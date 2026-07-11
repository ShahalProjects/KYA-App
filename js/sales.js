  function isSalesReturnInvoiceSelected() {
    if (currentSalesVoucherSubtype !== 'Return') return false;
    const triggerText = document.getElementById('salesInvoiceSelectTriggerText');
    return triggerText && triggerText.textContent !== 'Select Invoice';
  }

  function getInvoiceRemainingRows(origInv, excludeReturnId = null) {
    if (!origInv || !origInv.rows) return [];
    const postedReturns = (window.KYA_STORE.salesVouchers || []).filter(v => 
      v.isReturn && 
      v.returnAgainstInvoice === origInv.invoiceNo && 
      (excludeReturnId === null || v.id !== excludeReturnId)
    );
    const remainingRows = JSON.parse(JSON.stringify(origInv.rows));
    postedReturns.forEach(ret => {
      if (!ret.rows) return;
      ret.rows.forEach(retRow => {
        if (origInv.type === 'Product') {
          const match = remainingRows.find(r => r.item === retRow.item);
          if (match) {
            match.qty = Math.max(0, match.qty - (retRow.qty || 0));
            if (match.discountType !== 'pct') {
              match.discount = Math.max(0, match.discount - (retRow.discount || 0));
            }
          }
        } else {
          const match = remainingRows.find(r => r.revenueLedgerId == retRow.revenueLedgerId);
          if (match) {
            match.baseAmount = Math.max(0, match.baseAmount - (retRow.baseAmount || 0));
            if (match.discountType !== 'pct') {
              match.discount = Math.max(0, match.discount - (retRow.discount || 0));
            }
          }
        }
      });
    });
    return remainingRows;
  }

  function getOriginalInvoiceForReturn() {
    if (currentSalesVoucherSubtype !== 'Return') return null;
    const triggerText = document.getElementById('salesInvoiceSelectTriggerText');
    if (!triggerText || triggerText.textContent === 'Select Invoice') return null;
    const invNo = triggerText.textContent.trim();
    return (window.KYA_STORE.salesVouchers || []).find(v => v.invoiceNo === invNo && !v.isReturn);
  }

  function updateSalesReturnLockState() {
    const isLocked = isSalesReturnInvoiceSelected();
    
    const custEl = document.getElementById('salesCustomer');
    if (custEl) {
      custEl.disabled = isLocked;
      custEl.style.backgroundColor = isLocked ? 'var(--slate-50)' : '';
      custEl.style.cursor = isLocked ? 'not-allowed' : '';
    }
    
    const supplyTypeEl = document.getElementById('salesSupplyType');
    if (supplyTypeEl) {
      supplyTypeEl.disabled = isLocked;
      supplyTypeEl.style.backgroundColor = isLocked ? 'var(--slate-50)' : '';
      supplyTypeEl.style.cursor = isLocked ? 'not-allowed' : '';
    }
    
    const orderEl = document.getElementById('salesOrderNo');
    if (orderEl) {
      orderEl.disabled = isLocked;
      orderEl.style.backgroundColor = 'var(--slate-50)';
      orderEl.style.color = isLocked ? 'var(--slate-400)' : 'var(--slate-700)';
    }
    
    const execEl = document.getElementById('salesExecutive');
    if (execEl) {
      execEl.disabled = isLocked;
      execEl.style.backgroundColor = isLocked ? 'var(--slate-50)' : '';
      execEl.style.cursor = isLocked ? 'not-allowed' : '';
    }
    
    const prodBtn = document.getElementById('salesTypeProduct');
    const servBtn = document.getElementById('salesTypeService');
    if (prodBtn && servBtn) {
      prodBtn.disabled = isLocked;
      servBtn.disabled = isLocked;
      prodBtn.style.cursor = isLocked ? 'not-allowed' : '';
      servBtn.style.cursor = isLocked ? 'not-allowed' : '';
      if (isLocked) {
        prodBtn.style.opacity = '0.7';
        servBtn.style.opacity = '0.7';
      } else {
        prodBtn.style.opacity = '';
        servBtn.style.opacity = '';
      }
    }
    
    const addRowBtn = document.getElementById('salesAddRow');
    if (addRowBtn) {
      addRowBtn.disabled = isLocked;
      addRowBtn.style.cursor = isLocked ? 'not-allowed' : '';
      if (isLocked) {
        addRowBtn.style.opacity = '0.5';
        addRowBtn.style.pointerEvents = 'none';
      } else {
        addRowBtn.style.opacity = '';
        addRowBtn.style.pointerEvents = '';
      }
    }

    // Payment Status Buttons
    const payNotPaidBtn = document.getElementById('salesPaymentStatusNotPaid');
    const payFullBtn = document.getElementById('salesPaymentStatusFull');
    const payPartialBtn = document.getElementById('salesPaymentStatusPartial');
    
    if (payNotPaidBtn) { payNotPaidBtn.disabled = false; payNotPaidBtn.style.cursor = ''; payNotPaidBtn.style.opacity = ''; }
    if (payFullBtn) { payFullBtn.disabled = false; payFullBtn.style.cursor = ''; payFullBtn.style.opacity = ''; }
    if (payPartialBtn) { payPartialBtn.disabled = false; payPartialBtn.style.cursor = ''; payPartialBtn.style.opacity = ''; }
    
    // TDS/TCS Buttons
    const tdsTcsNoneBtn = document.getElementById('salesTdsTcsNone');
    const tdsTcsTdsBtn = document.getElementById('salesTdsTcsTds');
    const tdsTcsTcsBtn = document.getElementById('salesTdsTcsTcs');
    
    if (tdsTcsNoneBtn) { tdsTcsNoneBtn.disabled = false; tdsTcsNoneBtn.style.cursor = ''; tdsTcsNoneBtn.style.opacity = ''; }
    if (tdsTcsTdsBtn) { tdsTcsTdsBtn.disabled = false; tdsTcsTdsBtn.style.cursor = ''; tdsTcsTdsBtn.style.opacity = ''; }
    if (tdsTcsTcsBtn) { tdsTcsTcsBtn.disabled = false; tdsTcsTcsBtn.style.cursor = ''; tdsTcsTcsBtn.style.opacity = ''; }

    const payAmtEl = document.getElementById('salesPaymentAmount');
    if (payAmtEl) {
      payAmtEl.removeAttribute('max');
    }

    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    const customRateInput = document.getElementById('salesTdsTcsRateCustom');
    
    if (rateSelect) {
      rateSelect.disabled = false;
      rateSelect.style.backgroundColor = '';
      rateSelect.style.cursor = '';
    }
    if (customRateInput) {
      customRateInput.disabled = false;
      customRateInput.style.backgroundColor = '';
      customRateInput.style.cursor = '';
    }

    const origInv = getOriginalInvoiceForReturn();
    if (origInv) {
      if (origInv.paymentStatus === 'Not Paid') {
        if (payNotPaidBtn && !payNotPaidBtn.classList.contains('active')) {
          payNotPaidBtn.click();
        }
        if (payFullBtn) {
          payFullBtn.disabled = true;
          payFullBtn.style.cursor = 'not-allowed';
          payFullBtn.style.opacity = '0.5';
        }
        if (payPartialBtn) {
          payPartialBtn.disabled = true;
          payPartialBtn.style.cursor = 'not-allowed';
          payPartialBtn.style.opacity = '0.5';
        }
      } else if (origInv.paymentStatus === 'Full Payment' || origInv.paymentStatus === 'Partial Payment') {
        let origPaidAmt = 0;
        if (origInv.paymentStatus === 'Full Payment') {
          origPaidAmt = origInv.total;
        } else if (origInv.paymentStatus === 'Partial Payment') {
          origPaidAmt = origInv.paymentAmount || 0;
        }
        if (payAmtEl) {
          payAmtEl.max = origPaidAmt;
        }
      }

      if (!origInv.tdsTcsMode || origInv.tdsTcsMode === 'None') {
        if (tdsTcsNoneBtn && !tdsTcsNoneBtn.classList.contains('active')) {
          tdsTcsNoneBtn.click();
        }
        if (tdsTcsTdsBtn) {
          tdsTcsTdsBtn.disabled = true;
          tdsTcsTdsBtn.style.cursor = 'not-allowed';
          tdsTcsTdsBtn.style.opacity = '0.5';
        }
        if (tdsTcsTcsBtn) {
          tdsTcsTcsBtn.disabled = true;
          tdsTcsTcsBtn.style.cursor = 'not-allowed';
          tdsTcsTcsBtn.style.opacity = '0.5';
        }
      } else if (origInv.tdsTcsMode === 'TDS') {
        if (tdsTcsTdsBtn && !tdsTcsTdsBtn.classList.contains('active')) {
          tdsTcsTdsBtn.click();
        }
        if (tdsTcsNoneBtn) {
          tdsTcsNoneBtn.disabled = true;
          tdsTcsNoneBtn.style.cursor = 'not-allowed';
          tdsTcsNoneBtn.style.opacity = '0.5';
        }
        if (tdsTcsTcsBtn) {
          tdsTcsTcsBtn.disabled = true;
          tdsTcsTcsBtn.style.cursor = 'not-allowed';
          tdsTcsTcsBtn.style.opacity = '0.5';
        }
        if (rateSelect) {
          rateSelect.disabled = true;
          rateSelect.style.backgroundColor = 'var(--slate-50)';
          rateSelect.style.cursor = 'not-allowed';
        }
        if (customRateInput) {
          customRateInput.disabled = true;
          customRateInput.style.backgroundColor = 'var(--slate-50)';
          customRateInput.style.cursor = 'not-allowed';
        }
      } else if (origInv.tdsTcsMode === 'TCS') {
        if (tdsTcsTcsBtn && !tdsTcsTcsBtn.classList.contains('active')) {
          tdsTcsTcsBtn.click();
        }
        if (tdsTcsNoneBtn) {
          tdsTcsNoneBtn.disabled = true;
          tdsTcsNoneBtn.style.cursor = 'not-allowed';
          tdsTcsNoneBtn.style.opacity = '0.5';
        }
        if (tdsTcsTdsBtn) {
          tdsTcsTdsBtn.disabled = true;
          tdsTcsTdsBtn.style.cursor = 'not-allowed';
          tdsTcsTdsBtn.style.opacity = '0.5';
        }
        if (rateSelect) {
          rateSelect.disabled = true;
          rateSelect.style.backgroundColor = 'var(--slate-50)';
          rateSelect.style.cursor = 'not-allowed';
        }
        if (customRateInput) {
          customRateInput.disabled = true;
          customRateInput.style.backgroundColor = 'var(--slate-50)';
          customRateInput.style.cursor = 'not-allowed';
        }
      }
    }
  }

  function getSalesPaymentMax(total) {
    let maxVal = total;
    if (currentSalesVoucherSubtype === 'Invoice') {
      const orderNo = document.getElementById('salesOrderNo')?.value?.trim();
      if (orderNo) {
        const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
        if (linkedOrder) {
          let orderAdvanceAmount = 0;
          if (linkedOrder.paymentStatus === 'Full Payment') {
            orderAdvanceAmount = linkedOrder.total;
          } else if (linkedOrder.paymentStatus === 'Partial Payment') {
            orderAdvanceAmount = linkedOrder.paymentAmount || 0;
          }
          maxVal = Math.max(0, total - orderAdvanceAmount);
        }
      }
    } else if (currentSalesVoucherSubtype === 'Return') {
      const payAmtEl = document.getElementById('salesPaymentAmount');
      if (payAmtEl && payAmtEl.max) {
        const maxPaid = parseFloat(payAmtEl.max);
        if (!isNaN(maxPaid)) {
          maxVal = Math.min(total, maxPaid);
        }
      }
    }
    return maxVal;
  }

  function updateSalesPaymentUI() {
    const payNotPaidBtn = document.getElementById('salesPaymentStatusNotPaid');
    const payFullBtn = document.getElementById('salesPaymentStatusFull');
    const payPartialBtn = document.getElementById('salesPaymentStatusPartial');
    if (!payFullBtn || !payNotPaidBtn || !payPartialBtn) return;
    
    const subTotal = calculateSubtotal();
    let tdsTcsMode = 'None';
    const tdsBtn = document.getElementById('salesTdsTcsTds');
    const tcsBtn = document.getElementById('salesTdsTcsTcs');
    if (tdsBtn && tdsBtn.classList.contains('active')) tdsTcsMode = 'TDS';
    if (tcsBtn && tcsBtn.classList.contains('active')) tdsTcsMode = 'TCS';
    
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    let rate = 0;
    if (tdsTcsMode !== 'None' && rateSelect) {
      if (rateSelect.value === 'custom') {
        const customInput = document.getElementById('salesTdsTcsRateCustom');
        rate = customInput ? (parseFloat(customInput.value) || 0) : 0;
      } else {
        rate = parseFloat(rateSelect.value) || 0;
      }
    }
    const amountInput = document.getElementById('salesTdsTcsAmount');
    const tdsTcsAmount = amountInput ? (parseFloat(amountInput.value) || 0) : 0;
    const adjustmentsInput = document.getElementById('salesAdjustments');
    const adjustments = adjustmentsInput ? (parseFloat(adjustmentsInput.value) || 0) : 0;
    
    let total = subTotal;
    if (tdsTcsMode === 'TDS') total = subTotal - tdsTcsAmount;
    else if (tdsTcsMode === 'TCS') total = subTotal + tdsTcsAmount;
    total += adjustments;

    const maxVal = getSalesPaymentMax(total);
    
    const orderNo = document.getElementById('salesOrderNo')?.value?.trim();
    let orderAdvanceAmount = 0;
    let isOrderLinked = false;
    if (currentSalesVoucherSubtype === 'Invoice' && orderNo) {
      const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
      if (linkedOrder) {
        isOrderLinked = true;
        if (linkedOrder.paymentStatus === 'Full Payment') {
          orderAdvanceAmount = linkedOrder.total;
        } else if (linkedOrder.paymentStatus === 'Partial Payment') {
          orderAdvanceAmount = linkedOrder.paymentAmount || 0;
        }
      }
    }

    const excessAmount = isOrderLinked ? Math.max(0, orderAdvanceAmount - total) : 0;

    if (excessAmount > 0) {
      payNotPaidBtn.textContent = 'Not Refunded';
      payFullBtn.textContent = `Full Refund (₹${fmtNum(excessAmount)})`;
      payPartialBtn.textContent = 'Partial Refund';
      
      const payAmtEl = document.getElementById('salesPaymentAmount');
      if (payAmtEl) {
        payAmtEl.max = excessAmount;
      }
    } else {
      payNotPaidBtn.textContent = 'Not Paid';
      payPartialBtn.textContent = 'Partial Payment';
      if (isOrderLinked && orderAdvanceAmount > 0) {
        payFullBtn.textContent = `Full Payment (₹${fmtNum(maxVal)})`;
      } else {
        payFullBtn.textContent = 'Full Payment';
      }
    }
  }

  // Initialize store for future features
  if (!window.KYA_STORE) {
    window.KYA_STORE = {};
  }
  window.KYA_STORE.salesVouchers = window.KYA_STORE.salesVouchers || [];
  window.KYA_STORE.salesVouchersDrafts = window.KYA_STORE.salesVouchersDrafts || [];
  window.KYA_STORE.salesInvoiceCtr = window.KYA_STORE.salesInvoiceCtr || 1;
  window.KYA_STORE.salesReturnCtr = window.KYA_STORE.salesReturnCtr || 1;
  window.KYA_STORE.salesOrderCtr = window.KYA_STORE.salesOrderCtr || 1;

  function getNextAutoInvoiceNumber() {
    const year = new Date().getFullYear();
    if (currentSalesVoucherSubtype === 'Return') {
      const ctr = window.KYA_STORE.salesReturnCtr || 1;
      return `RET-${year}-${String(ctr).padStart(3, '0')}`;
    } else if (currentSalesVoucherSubtype === 'Order') {
      const ctr = window.KYA_STORE.salesOrderCtr || 1;
      return `SO-${year}-${String(ctr).padStart(3, '0')}`;
    } else {
      const ctr = window.KYA_STORE.salesInvoiceCtr || 1;
      return `INV-${year}-${String(ctr).padStart(3, '0')}`;
    }
  }

  function setInvoiceNoMode(mode) {
    currentSalesInvoiceMode = 'Auto';
    const invNoEl = document.getElementById('salesInvoiceNo');
    const chipEl = document.getElementById('salesVoucherChipDisplay');
    
    if (!invNoEl || !chipEl) return;

    if (mode === 'Auto') {
      invNoEl.value = getNextAutoInvoiceNumber();
      chipEl.textContent = invNoEl.value;
    }
    
    if (invNoEl) {
      let ph = 'INV-2026-001';
      if (currentSalesVoucherSubtype === 'Return') ph = 'RET-2026-001';
      else if (currentSalesVoucherSubtype === 'Order') ph = 'SO-2026-001';
      invNoEl.placeholder = ph;
    }
    
    invNoEl.removeAttribute('readonly');
    invNoEl.style.background = '#fff';
    invNoEl.style.color = 'var(--slate-900)';
  }

  function populateSalesCustomers(selectedId = null) {
    const custSelect = document.getElementById('salesCustomer');
    if (!custSelect) return;
    
    custSelect.innerHTML = '<option value="">&mdash; Select Customer &mdash;</option>';
    
    const customers = coaLedgers.filter(l => l.type === 'ledger' && l.sgId === 'sg-tr');
    customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      const akaStr = c.aliases && c.aliases.length > 0 ? ` [A.K.A: ${c.aliases.join(', ')}]` : '';
      opt.textContent = c.name + akaStr;
      if (selectedId && c.id == selectedId) {
        opt.selected = true;
      }
      custSelect.appendChild(opt);
    });
  }

  function populateSalesExecutives(selectedId = null) {
    const execSelect = document.getElementById('salesExecutive');
    if (!execSelect) return;
    
    execSelect.innerHTML = '<option value="">&mdash; Select Sales Executive &mdash;</option>';
    
    ohEmployees.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.name} (${e.code})`;
      if (selectedId && e.id == selectedId) {
        opt.selected = true;
      }
      execSelect.appendChild(opt);
    });
  }

  function handleSupplyTypeChange() {
    const supplyType = document.getElementById('salesSupplyType').value;
    const isZeroTax = supplyType === 'Export (Zero-Rated / LUT)' || supplyType === 'SEZ Without Tax';
    
    salesRows.forEach(row => {
      if (isZeroTax) {
        row.tax = 0;
        const base = currentSalesType === 'Product' ? (row.qty * row.rate) : row.baseAmount;
        const discAmt = row.discountType === 'pct' ? (base * (row.discount / 100)) : row.discount;
        row.amount = Math.max(0, base - discAmt);
      }
    });
    
    renderSalesRows();
    recalculateSalesTotals();
  }

  function populateSalesPaymentAccounts(selectedId = null) {
    const paySelect = document.getElementById('salesPaymentAccount');
    if (!paySelect) return;
    
    paySelect.innerHTML = '<option value="">&mdash; Select &mdash;</option>';
    
    const accounts = coaLedgers.filter(l => l.type === 'ledger' && l.sgId === 'sg-cce');
    accounts.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.name;
      if (selectedId && a.id == selectedId) {
        opt.selected = true;
      }
      paySelect.appendChild(opt);
    });
  }

  function getSalesPaymentStatus() {
    const fullBtn = document.getElementById('salesPaymentStatusFull');
    const partBtn = document.getElementById('salesPaymentStatusPartial');
    
    const orderNo = document.getElementById('salesOrderNo')?.value?.trim();
    let orderAdvanceAmount = 0;
    let total = calculateSubtotal();
    let tdsTcsMode = 'None';
    const tdsBtn = document.getElementById('salesTdsTcsTds');
    const tcsBtn = document.getElementById('salesTdsTcsTcs');
    if (tdsBtn && tdsBtn.classList.contains('active')) tdsTcsMode = 'TDS';
    if (tcsBtn && tcsBtn.classList.contains('active')) tdsTcsMode = 'TCS';
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    let rate = 0;
    if (tdsTcsMode !== 'None' && rateSelect) {
      if (rateSelect.value === 'custom') {
        const customInput = document.getElementById('salesTdsTcsRateCustom');
        rate = customInput ? (parseFloat(customInput.value) || 0) : 0;
      } else {
        rate = parseFloat(rateSelect.value) || 0;
      }
    }
    const amountInput = document.getElementById('salesTdsTcsAmount');
    const tdsTcsAmount = amountInput ? (parseFloat(amountInput.value) || 0) : 0;
    const adjustmentsInput = document.getElementById('salesAdjustments');
    const adjustments = adjustmentsInput ? (parseFloat(adjustmentsInput.value) || 0) : 0;
    
    let grandTotal = total;
    if (tdsTcsMode === 'TDS') grandTotal = total - tdsTcsAmount;
    else if (tdsTcsMode === 'TCS') grandTotal = total + tdsTcsAmount;
    grandTotal += adjustments;

    let isOrderLinked = false;
    if (currentSalesVoucherSubtype === 'Invoice' && orderNo) {
      const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
      if (linkedOrder) {
        isOrderLinked = true;
        if (linkedOrder.paymentStatus === 'Full Payment') {
          orderAdvanceAmount = linkedOrder.total;
        } else if (linkedOrder.paymentStatus === 'Partial Payment') {
          orderAdvanceAmount = linkedOrder.paymentAmount || 0;
        }
      }
    }
    const excessAmount = isOrderLinked ? Math.max(0, orderAdvanceAmount - grandTotal) : 0;

    if (excessAmount > 0) {
      if (fullBtn && fullBtn.classList.contains('active')) return 'Full Refund';
      if (partBtn && partBtn.classList.contains('active')) return 'Partial Refund';
      return 'Not Refunded';
    } else {
      if (fullBtn && fullBtn.classList.contains('active')) return 'Full Payment';
      if (partBtn && partBtn.classList.contains('active')) return 'Partial Payment';
      return 'Not Paid';
    }
  }

  function getOrCreateSystemLedger(name, sgId) {
    let ldg = coaLedgers.find(l => l.type === 'ledger' && l.name.toLowerCase() === name.toLowerCase());
    if (!ldg) {
      const newId = Date.now() + _coaLedgerCtr++;
      ldg = {
        id: newId,
        sgId: sgId,
        glId: null,
        name: name,
        code: '',
        openingBalance: 0,
        type: 'ledger'
      };
      coaLedgers.push(ldg);
      
      const sg = COA_SYS_SGS.find(s => s.id === sgId);
      if (sg) {
        _coaExpanded.add(sgId);
        if (sg.parent) _coaExpanded.add(sg.parent);
        _coaExpanded.add(sg.main);
      }
      
      renderChartPanel();
      refreshAllReports();
      triggerAutoBackup();
    }
    return ldg.id;
  }

  function getIncomeLedgers() {
    let list = coaLedgers.filter(l => l.type === 'ledger' && (l.sgId === 'sg-rfo' || l.sgId === 'sg-oi'));
    if (list.length === 0) {
      getOrCreateSystemLedger('Sales Account', 'sg-rfo');
      list = coaLedgers.filter(l => l.type === 'ledger' && (l.sgId === 'sg-rfo' || l.sgId === 'sg-oi'));
    }
    return list;
  }

  function renderSalesHeaders() {
    const headerRow = document.getElementById('salesTableHeader');
    if (!headerRow) return;
    
    if (currentSalesType === 'Product') {
      headerRow.innerHTML = `
        <th class="col-item">Item Name</th>
        <th class="col-qty" style="width: 80px; text-align: right;">Qty</th>
        <th class="col-rate" style="width: 120px; text-align: right;">Rate</th>
        <th class="col-disc" style="width: 140px; text-align: right;">Discount</th>
        <th class="col-tax" style="width: 100px; text-align: right; padding-right: 28px;">Tax</th>
        <th class="col-amt" style="width: 140px; text-align: right;">Amount</th>
        <th class="col-del" style="width: 50px; text-align: center;"></th>
      `;
    } else {
      headerRow.innerHTML = `
        <th class="col-item">Revenue Account</th>
        <th class="col-rate" style="width: 150px; text-align: right;">Base Amount</th>
        <th class="col-disc" style="width: 140px; text-align: right;">Discount</th>
        <th class="col-tax" style="width: 100px; text-align: right; padding-right: 28px;">Tax</th>
        <th class="col-amt" style="width: 140px; text-align: right;">Amount</th>
        <th class="col-del" style="width: 50px; text-align: center;"></th>
      `;
    }
  }

  function renderSalesRows() {
    renderSalesHeaders();
    const body = document.getElementById('salesItemBody');
    if (!body) return;
    
    body.innerHTML = '';
    const incomeLedgers = getIncomeLedgers();
    const isLocked = isSalesReturnInvoiceSelected();
    
    const supplyTypeEl = document.getElementById('salesSupplyType');
    const isZeroTax = supplyTypeEl && (supplyTypeEl.value === 'Export (Zero-Rated / LUT)' || supplyTypeEl.value === 'SEZ Without Tax');
    
    salesRows.forEach((row, index) => {
      if (isZeroTax) {
        row.tax = 0;
        const base = currentSalesType === 'Product' ? (row.qty * row.rate) : row.baseAmount;
        const discAmt = row.discountType === 'pct' ? (base * (row.discount / 100)) : row.discount;
        row.amount = Math.max(0, base - discAmt);
      }

      let trHtml = '';
      if (currentSalesType === 'Product') {
        trHtml = `
          <tr class="sales-row" data-row-index="${index}">
            <td>
              <input type="text" class="sales-row-item je-input" value="${ohEsc(row.item || '')}" placeholder="Item Description" style="border: none; background: transparent; box-shadow: none; padding: 0; ${isLocked ? 'cursor: not-allowed; color: var(--slate-500);' : ''}" ${isLocked ? 'readonly' : ''} />
            </td>
            <td style="width: 80px;">
              <input type="number" class="sales-row-qty je-input" value="${row.qty}" min="0" style="border: none; background: transparent; box-shadow: none; text-align: right; padding: 0;" />
            </td>
            <td style="width: 120px;">
              <input type="number" class="sales-row-rate je-input" value="${row.rate === 0 ? '' : row.rate}" placeholder="0.00" min="0" step="0.01" style="border: none; background: transparent; box-shadow: none; text-align: right; padding: 0;" />
            </td>
            <td style="width: 140px;">
              <div style="display: flex; gap: 4px; align-items: center; justify-content: flex-end;">
                <input type="number" class="sales-row-discount je-input" value="${row.discount === 0 ? '' : row.discount}" placeholder="0.00" min="0" step="0.01" style="border: none; background: transparent; box-shadow: none; text-align: right; width: 70px; padding: 0;" />
                <select class="sales-row-discount-type je-input" style="border: none; background: transparent; box-shadow: none; width: 30px; padding: 0; font-weight: 600; cursor: pointer; text-align: center; text-align-last: center; -webkit-appearance: none; -moz-appearance: none; appearance: none; ${isLocked ? 'cursor: not-allowed; color: var(--slate-500);' : ''}" ${isLocked ? 'disabled' : ''}>
                  <option value="val" ${row.discountType === 'val' || !row.discountType ? 'selected' : ''}>₹</option>
                  <option value="pct" ${row.discountType === 'pct' ? 'selected' : ''}>%</option>
                </select>
              </div>
            </td>
            <td style="width: 100px;">
              <select class="sales-row-tax je-input" style="border: none; background: transparent; box-shadow: none; text-align: right; text-align-last: right; padding-right: 16px;" ${isZeroTax ? 'disabled' : ''}>
                <option value="0" ${row.tax === 0 ? 'selected' : ''}>0%</option>
                <option value="5" ${row.tax === 5 ? 'selected' : ''}>5%</option>
                <option value="12" ${row.tax === 12 ? 'selected' : ''}>12%</option>
                <option value="18" ${row.tax === 18 ? 'selected' : ''}>18%</option>
                <option value="28" ${row.tax === 28 ? 'selected' : ''}>28%</option>
              </select>
            </td>
            <td style="width: 140px; text-align: right; padding-right: 12px; font-weight: 600;" class="sales-row-amount">
              ₹ ${fmtNum(row.amount)}
            </td>
            <td style="width: 50px; text-align: center;">
              <button type="button" class="sales-del-row" style="background: none; border: none; color: var(--red-600); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;" onmouseover="this.style.backgroundColor='var(--red-50)'" onmouseout="this.style.backgroundColor='transparent'">
                <svg viewBox="0 0 15 15" fill="none" style="width: 14px; height: 14px;">
                  <path d="M5.5 2h4M1.5 4h12M2.5 4l1 9.5a1 1 0 001 .5h6a1 1 0 001-.5l1-9.5M5.5 6.5v5M9.5 6.5v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            </td>
          </tr>
        `;
      } else {
        trHtml = `
          <tr class="sales-row" data-row-index="${index}">
            <td>
              <select class="sales-row-rev-acc je-input" style="border: none; background: transparent; box-shadow: none; padding: 0; ${isLocked ? 'cursor: not-allowed; color: var(--slate-500);' : ''}" ${isLocked ? 'disabled' : ''}>
                <option value="">&mdash; Select Revenue Account &mdash;</option>
                ${incomeLedgers.map(l => {
                  const akaStr = l.aliases && l.aliases.length > 0 ? ` [A.K.A: ${l.aliases.join(', ')}]` : '';
                  return `<option value="${l.id}" ${row.revenueLedgerId == l.id ? 'selected' : ''}>${l.name}${akaStr}</option>`;
                }).join('')}
              </select>
            </td>
            <td style="width: 150px;">
              <input type="number" class="sales-row-base je-input" value="${row.baseAmount === 0 ? '' : row.baseAmount}" placeholder="0.00" min="0" step="0.01" style="border: none; background: transparent; box-shadow: none; text-align: right; padding: 0;" />
            </td>
            <td style="width: 140px;">
              <div style="display: flex; gap: 4px; align-items: center; justify-content: flex-end;">
                <input type="number" class="sales-row-discount je-input" value="${row.discount === 0 ? '' : row.discount}" placeholder="0.00" min="0" step="0.01" style="border: none; background: transparent; box-shadow: none; text-align: right; width: 70px; padding: 0;" />
                <select class="sales-row-discount-type je-input" style="border: none; background: transparent; box-shadow: none; width: 30px; padding: 0; font-weight: 600; cursor: pointer; text-align: center; text-align-last: center; -webkit-appearance: none; -moz-appearance: none; appearance: none; ${isLocked ? 'cursor: not-allowed; color: var(--slate-500);' : ''}" ${isLocked ? 'disabled' : ''}>
                  <option value="val" ${row.discountType === 'val' || !row.discountType ? 'selected' : ''}>₹</option>
                  <option value="pct" ${row.discountType === 'pct' ? 'selected' : ''}>%</option>
                </select>
              </div>
            </td>
            <td style="width: 100px;">
              <select class="sales-row-tax je-input" style="border: none; background: transparent; box-shadow: none; text-align: right; text-align-last: right; padding-right: 16px;" ${isZeroTax ? 'disabled' : ''}>
                <option value="0" ${row.tax === 0 ? 'selected' : ''}>0%</option>
                <option value="5" ${row.tax === 5 ? 'selected' : ''}>5%</option>
                <option value="12" ${row.tax === 12 ? 'selected' : ''}>12%</option>
                <option value="18" ${row.tax === 18 ? 'selected' : ''}>18%</option>
                <option value="28" ${row.tax === 28 ? 'selected' : ''}>28%</option>
              </select>
            </td>
            <td style="width: 140px; text-align: right; padding-right: 12px; font-weight: 600;" class="sales-row-amount">
              ₹ ${fmtNum(row.amount)}
            </td>
            <td style="width: 50px; text-align: center;">
              <button type="button" class="sales-del-row" style="background: none; border: none; color: var(--red-600); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;" onmouseover="this.style.backgroundColor='var(--red-50)'" onmouseout="this.style.backgroundColor='transparent'">
                <svg viewBox="0 0 15 15" fill="none" style="width: 14px; height: 14px;">
                  <path d="M5.5 2h4M1.5 4h12M2.5 4l1 9.5a1 1 0 001 .5h6a1 1 0 001-.5l1-9.5M5.5 6.5v5M9.5 6.5v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            </td>
          </tr>
        `;
      }
      
      const tempDiv = document.createElement('tbody');
      tempDiv.innerHTML = trHtml;
      const tr = tempDiv.firstElementChild;
      body.appendChild(tr);
    });
  }

  function addSalesRow() {
    if (currentSalesType === 'Product') {
      salesRows.push({ item: '', qty: 1, rate: 0, discount: 0, discountType: 'val', tax: 18, amount: 0 });
    } else {
      salesRows.push({ revenueLedgerId: '', baseAmount: 0, discount: 0, discountType: 'val', tax: 18, amount: 0 });
    }
    renderSalesRows();
    recalculateSalesTotals();
  }

  function switchSalesType(type) {
    currentSalesType = type;
    salesRows = [];
    addSalesRow();
  }

  function updateRowFromDOM(index, tr) {
    const row = salesRows[index];
    if (!row) return;
    
    if (currentSalesType === 'Product') {
      row.item = tr.querySelector('.sales-row-item').value;
      
      let qty = parseFloat(tr.querySelector('.sales-row-qty').value) || 0;
      let rate = parseFloat(tr.querySelector('.sales-row-rate').value) || 0;
      let discount = parseFloat(tr.querySelector('.sales-row-discount').value) || 0;
      
      if (currentSalesVoucherSubtype === 'Return' && row.origQty !== undefined) {
        if (qty > row.origQty) {
          qty = row.origQty;
          tr.querySelector('.sales-row-qty').value = qty;
          showToast(`Quantity cannot exceed remaining quantity of ${row.origQty}.`, 'warning');
        }
        if (rate > row.origRate) {
          rate = row.origRate;
          tr.querySelector('.sales-row-rate').value = rate === 0 ? '' : rate;
          showToast(`Rate cannot exceed original invoice rate of ₹${fmtNum(row.origRate)}.`, 'warning');
        }
        if (discount > row.origDiscount) {
          discount = row.origDiscount;
          tr.querySelector('.sales-row-discount').value = discount === 0 ? '' : discount;
          showToast(`Discount cannot exceed remaining discount of ${row.origDiscountType === 'pct' ? '' : '₹'}${fmtNum(row.origDiscount)}${row.origDiscountType === 'pct' ? '%' : ''}.`, 'warning');
        }
      }
      
      row.qty = qty;
      row.rate = rate;
      row.discount = discount;
      row.discountType = tr.querySelector('.sales-row-discount-type').value;
      row.tax = parseFloat(tr.querySelector('.sales-row-tax').value) || 0;
      
      const base = row.qty * row.rate;
      const discAmt = row.discountType === 'pct' ? (base * (row.discount / 100)) : row.discount;
      const afterDiscount = Math.max(0, base - discAmt);
      const taxAmt = afterDiscount * (row.tax / 100);
      row.amount = afterDiscount + taxAmt;
    } else {
      row.revenueLedgerId = tr.querySelector('.sales-row-rev-acc').value;
      
      let baseAmount = parseFloat(tr.querySelector('.sales-row-base').value) || 0;
      let discount = parseFloat(tr.querySelector('.sales-row-discount').value) || 0;
      
      if (currentSalesVoucherSubtype === 'Return' && row.origBaseAmount !== undefined) {
        if (baseAmount > row.origBaseAmount) {
          baseAmount = row.origBaseAmount;
          tr.querySelector('.sales-row-base').value = baseAmount === 0 ? '' : baseAmount;
          showToast(`Base Amount cannot exceed remaining base amount of ₹${fmtNum(row.origBaseAmount)}.`, 'warning');
        }
        if (discount > row.origDiscount) {
          discount = row.origDiscount;
          tr.querySelector('.sales-row-discount').value = discount === 0 ? '' : discount;
          showToast(`Discount cannot exceed remaining discount of ${row.origDiscountType === 'pct' ? '' : '₹'}${fmtNum(row.origDiscount)}${row.origDiscountType === 'pct' ? '%' : ''}.`, 'warning');
        }
      }
      
      row.baseAmount = baseAmount;
      row.discount = discount;
      row.discountType = tr.querySelector('.sales-row-discount-type').value;
      row.tax = parseFloat(tr.querySelector('.sales-row-tax').value) || 0;
      
      const discAmt = row.discountType === 'pct' ? (row.baseAmount * (row.discount / 100)) : row.discount;
      const afterDiscount = Math.max(0, row.baseAmount - discAmt);
      const taxAmt = afterDiscount * (row.tax / 100);
      row.amount = afterDiscount + taxAmt;
    }
    
    tr.querySelector('.sales-row-amount').textContent = '₹ ' + fmtNum(row.amount);
    recalculateSalesTotals();
  }

  function calculateSubtotal() {
    let sub = 0;
    salesRows.forEach(r => {
      sub += r.amount || 0;
    });
    return sub;
  }

  function recalculateSalesTotals() {
    const subTotal = calculateSubtotal();
    const subTotalEl = document.getElementById('salesSubTotal');
    if (subTotalEl) subTotalEl.textContent = '₹ ' + fmtNum(subTotal);
    
    let tdsTcsMode = 'None';
    const tdsBtn = document.getElementById('salesTdsTcsTds');
    const tcsBtn = document.getElementById('salesTdsTcsTcs');
    if (tdsBtn && tdsBtn.classList.contains('active')) tdsTcsMode = 'TDS';
    if (tcsBtn && tcsBtn.classList.contains('active')) tdsTcsMode = 'TCS';
    
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    const customWrap = document.getElementById('salesTdsTcsRateCustomWrap');
    let rate = 0;
    
    if (tdsTcsMode === 'None') {
      rate = 0;
    } else if (rateSelect) {
      if (rateSelect.value === 'custom') {
        if (customWrap) customWrap.style.display = 'block';
        const customInput = document.getElementById('salesTdsTcsRateCustom');
        rate = customInput ? (parseFloat(customInput.value) || 0) : 0;
      } else {
        if (customWrap) customWrap.style.display = 'none';
        rate = parseFloat(rateSelect.value) || 0;
      }
    }
    
    const rateLabel = document.getElementById('salesTdsTcsRateLabel');
    if (rateLabel) {
      rateLabel.textContent = (rate % 1 === 0 ? rate.toFixed(0) : (rate * 10 % 1 === 0 ? rate.toFixed(1) : rate.toFixed(2))) + '%';
    }
    
    const amountInput = document.getElementById('salesTdsTcsAmount');
    
    if (amountInput && document.activeElement !== amountInput) {
      if (tdsTcsMode !== 'None') {
        const calculatedAmt = subTotal * (rate / 100);
        amountInput.value = calculatedAmt.toFixed(2);
      } else {
        amountInput.value = '';
      }
    }
    
    const tdsTcsAmount = amountInput ? (parseFloat(amountInput.value) || 0) : 0;
    const adjustmentsInput = document.getElementById('salesAdjustments');
    const adjustments = adjustmentsInput ? (parseFloat(adjustmentsInput.value) || 0) : 0;
    
    let total = subTotal;
    if (tdsTcsMode === 'TDS') {
      total = subTotal - tdsTcsAmount;
    } else if (tdsTcsMode === 'TCS') {
      total = subTotal + tdsTcsAmount;
    }
    total += adjustments;
    
    const totalEl = document.getElementById('salesTotal');
    if (totalEl) totalEl.textContent = '₹ ' + fmtNum(total);

    // Adjust Payment Amount in real-time if it exceeds the new Grand Total or Balance Payment
    const payAmtEl = document.getElementById('salesPaymentAmount');
    if (payAmtEl) {
      const maxVal = getSalesPaymentMax(total);
      const orderNo = document.getElementById('salesOrderNo')?.value?.trim();
      const isOrderLinked = (currentSalesVoucherSubtype === 'Invoice' && orderNo);
      
      let orderAdvanceAmount = 0;
      if (isOrderLinked) {
        const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
        if (linkedOrder) {
          if (linkedOrder.paymentStatus === 'Full Payment') {
            orderAdvanceAmount = linkedOrder.total;
          } else if (linkedOrder.paymentStatus === 'Partial Payment') {
            orderAdvanceAmount = linkedOrder.paymentAmount || 0;
          }
        }
      }
      const excessAmount = Math.max(0, orderAdvanceAmount - total);

      if (isOrderLinked) {
        payAmtEl.max = excessAmount > 0 ? excessAmount : maxVal;
      } else if (currentSalesVoucherSubtype === 'Return' && payAmtEl.max) {
        // Keep return logic max as set in updateSalesReturnLockState
      } else {
        payAmtEl.removeAttribute('max');
      }
      
      if (payAmtEl.value) {
        const currentVal = parseFloat(payAmtEl.value) || 0;
        const allowedMax = (isOrderLinked && excessAmount > 0) ? excessAmount : maxVal;
        if (currentVal > allowedMax) {
          payAmtEl.value = allowedMax.toFixed(2);
          const limitMsg = (isOrderLinked && excessAmount > 0)
            ? `Refund Amount adjusted to ₹${fmtNum(allowedMax)} to not exceed the excess refund amount.`
            : (isOrderLinked 
               ? `Payment Amount adjusted to ₹${fmtNum(allowedMax)} to not exceed the balance payment.`
               : `Payment Amount adjusted to ₹${fmtNum(allowedMax)} to not exceed the Grand Total.`);
          showToast(limitMsg, 'warning');
        }
      }
    }
    
    // Show/hide Refund Info Message banner
    const refundInfoEl = document.getElementById('salesRefundInfoMessage');
    const payStatusWrapEl = document.querySelector('.sales-paystatus-wrap');
    if (refundInfoEl && payStatusWrapEl) {
      let orderAdvanceAmount = 0;
      const orderNo = document.getElementById('salesOrderNo')?.value?.trim();
      const isOrderLinked = (currentSalesVoucherSubtype === 'Invoice' && orderNo);
      
      if (isOrderLinked) {
        const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
        if (linkedOrder) {
          if (linkedOrder.paymentStatus === 'Full Payment') {
            orderAdvanceAmount = linkedOrder.total;
          } else if (linkedOrder.paymentStatus === 'Partial Payment') {
            orderAdvanceAmount = linkedOrder.paymentAmount || 0;
          }
        }
      }
      
      const excessAmount = Math.max(0, orderAdvanceAmount - total);
      if (isOrderLinked && excessAmount > 0) {
        payStatusWrapEl.style.display = 'flex';
        refundInfoEl.style.display = 'block';
        
        const payStatus = getSalesPaymentStatus();
        if (payStatus === 'Full Refund') {
          refundInfoEl.textContent = `Refund due: ₹${fmtNum(excessAmount)} (Fully Refunded now). This will be paid from the selected Payment Account.`;
        } else if (payStatus === 'Partial Refund') {
          const refundAmt = parseFloat(document.getElementById('salesPaymentAmount')?.value) || 0;
          const remaining = Math.max(0, excessAmount - refundAmt);
          refundInfoEl.textContent = `Refund due: ₹${fmtNum(excessAmount)} (₹${fmtNum(refundAmt)} refunded now, ₹${fmtNum(remaining)} Refund Payable).`;
        } else {
          refundInfoEl.textContent = `Refund due: ₹${fmtNum(excessAmount)} (Refund later). This will be recorded under Refund Payable and will set status to Not Refunded.`;
        }
      } else {
        payStatusWrapEl.style.display = 'flex';
        refundInfoEl.style.display = 'none';
        refundInfoEl.textContent = '';
      }
    }
    
    updateSalesPaymentUI();
  }

  function updateVoucherSubtypeUI() {
    const newSalesBtn = document.getElementById('btnNewSales');
    const returnBtn = document.getElementById('btnSalesReturn');
    const orderBtn = document.getElementById('btnSalesOrder');
    const rejectionBtn = document.getElementById('btnSalesRejection');
    const cardTitle = document.querySelector('#panel-sales-voucher .je-card-title-text');
    const cardSubtitle = document.querySelector('#panel-sales-voucher .je-card-subtitle-text');
    const invoiceNoLabel = document.getElementById('lblSalesInvoiceNo');
    const invoiceNoInput = document.getElementById('salesInvoiceNo');
    const selectWrap = document.getElementById('salesInvoiceSelectWrap');
    const invoiceNoContainer = document.getElementById('salesInvoiceNoContainer');
    const orderNoContainer = document.getElementById('salesOrderNoContainer');
    const postSalesBtn = document.getElementById('btnPostSales');

    if (invoiceNoLabel) invoiceNoLabel.textContent = 'Invoice No.';

    const activeBtn = (btn) => {
      if (btn) {
        btn.className = 'btn btn-primary';
        btn.style.background = 'var(--blue-700)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--blue-700)';
      }
    };
    const deactiveBtn = (btn) => {
      if (btn) {
        btn.className = 'btn-sales-action';
        btn.style.background = 'var(--white)';
        btn.style.color = 'var(--slate-600)';
        btn.style.borderColor = 'var(--slate-200)';
      }
    };

    deactiveBtn(newSalesBtn);
    deactiveBtn(returnBtn);
    deactiveBtn(orderBtn);
    deactiveBtn(rejectionBtn);

    if (currentSalesVoucherSubtype === 'Return') {
      activeBtn(returnBtn);
      if (cardTitle) cardTitle.textContent = 'Sales Return';
      if (cardSubtitle) cardSubtitle.textContent = 'Record sales returns and customer credits';
      if (invoiceNoContainer) invoiceNoContainer.style.display = 'block';
      if (invoiceNoInput) invoiceNoInput.style.display = 'none';
      if (selectWrap) {
        selectWrap.style.display = 'block';
        refreshSalesInvoiceDropdownOptions();
      }
      if (orderNoContainer) orderNoContainer.style.display = 'block';
      if (postSalesBtn) {
        postSalesBtn.innerHTML = `<svg viewBox="0 0 15 15" fill="none" style="width:14px; height:14px; margin-right:6px; display:inline-block; vertical-align:middle;"><path d="M2.5 8l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> Post Return`;
      }
    } else if (currentSalesVoucherSubtype === 'Order') {
      activeBtn(orderBtn);
      if (cardTitle) cardTitle.textContent = 'Sales Order';
      if (cardSubtitle) cardSubtitle.textContent = 'Place customer orders without impact on books';
      if (invoiceNoContainer) invoiceNoContainer.style.display = 'block';
      if (invoiceNoLabel) invoiceNoLabel.textContent = 'Order No.';
      if (invoiceNoInput) {
        invoiceNoInput.style.display = 'block';
        invoiceNoInput.placeholder = 'SO-2026-001';
      }
      if (selectWrap) selectWrap.style.display = 'none';
      if (orderNoContainer) orderNoContainer.style.display = 'none';
      if (postSalesBtn) {
        postSalesBtn.innerHTML = `<svg viewBox="0 0 15 15" fill="none" style="width:14px; height:14px; margin-right:6px; display:inline-block; vertical-align:middle;"><path d="M2.5 8l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> Place Order`;
      }
    } else {
      activeBtn(newSalesBtn);
      if (cardTitle) cardTitle.textContent = 'Sales Invoice';
      if (cardSubtitle) cardSubtitle.textContent = 'Record sales transactions and customer receivables';
      if (invoiceNoContainer) invoiceNoContainer.style.display = 'block';
      if (invoiceNoInput) {
        invoiceNoInput.style.display = 'block';
        invoiceNoInput.placeholder = 'INV-2026-001';
      }
      if (selectWrap) selectWrap.style.display = 'none';
      if (orderNoContainer) orderNoContainer.style.display = 'block';
      if (postSalesBtn) {
        postSalesBtn.innerHTML = `<svg viewBox="0 0 15 15" fill="none" style="width:14px; height:14px; margin-right:6px; display:inline-block; vertical-align:middle;"><path d="M2.5 8l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> Post Invoice`;
      }
    }
  }

  function refreshSalesInvoiceDropdownOptions(filter = '') {
    const optionsList = document.getElementById('salesInvoiceSelectOptionsList');
    const triggerText = document.getElementById('salesInvoiceSelectTriggerText');
    if (!optionsList || !triggerText) return;

    optionsList.innerHTML = '';
    
    // Get all posted invoices that are NOT returns, NOT orders, and NOT completely returned
    const invoices = (window.KYA_STORE.salesVouchers || []).filter(v => {
      if (v.isReturn || v.isOrder) return false;
      const remainingRows = getInvoiceRemainingRows(v);
      if (v.type === 'Product') {
        return remainingRows.some(row => row.qty > 0);
      } else {
        return remainingRows.some(row => row.baseAmount > 0);
      }
    });
    
    const query = filter.toLowerCase().trim();
    let matchCount = 0;
    
    invoices.forEach(inv => {
      const custName = inv.customerId ? ((coaLedgers.find(l => l.id == inv.customerId) || { name: 'Customer' }).name) : 'No Customer';
      const text = `${inv.invoiceNo} - ${custName} (${inv.date}) - ₹${fmtNum(inv.total)}`;
      if (query && !text.toLowerCase().includes(query)) {
        return;
      }
      matchCount++;
      
      const item = document.createElement('div');
      item.style.padding = '8px 12px';
      item.style.fontSize = '13px';
      item.style.borderRadius = '6px';
      item.style.cursor = 'pointer';
      item.style.fontWeight = '500';
      item.style.color = 'var(--slate-700)';
      item.style.whiteSpace = 'nowrap';
      item.style.overflow = 'hidden';
      item.style.textOverflow = 'ellipsis';
      
      item.textContent = text;
      
      item.addEventListener('mouseover', () => {
        item.style.background = 'var(--slate-50)';
      });
      item.addEventListener('mouseout', () => {
        item.style.background = 'transparent';
      });
      
      item.addEventListener('click', () => {
        triggerText.textContent = inv.invoiceNo;
        
        autoFillFormFromInvoice(inv);
        
        const dropdown = document.getElementById('salesInvoiceSelectDropdown');
        if (dropdown) dropdown.style.display = 'none';
      });
      
      optionsList.appendChild(item);
    });
    
    if (matchCount === 0) {
      const noResult = document.createElement('div');
      noResult.style.padding = '8px 12px';
      noResult.style.fontSize = '12px';
      noResult.style.color = 'var(--slate-400)';
      noResult.style.textAlign = 'center';
      noResult.textContent = 'No matching invoices';
      optionsList.appendChild(noResult);
    }
  }

  function autoFillFormFromInvoice(inv) {
    const custEl = document.getElementById('salesCustomer');
    if (custEl) {
      custEl.value = inv.customerId;
      populateSalesCustomers(inv.customerId);
    }
    
    const execEl = document.getElementById('salesExecutive');
    if (execEl) {
      execEl.value = inv.salesExecutiveId || '';
      populateSalesExecutives(inv.salesExecutiveId);
    }
    
    const supplyTypeEl = document.getElementById('salesSupplyType');
    if (supplyTypeEl) {
      supplyTypeEl.value = inv.salesSupplyType || 'Intra-State (CGST + SGST)';
    }
    
    const notesEl = document.getElementById('salesNotes');
    if (notesEl) {
      notesEl.value = `Return against invoice ${inv.invoiceNo}. ${inv.notes || ''}`;
    }
    
    const adjEl = document.getElementById('salesAdjustments');
    if (adjEl) {
      adjEl.value = inv.adjustments || '';
    }
    
    const noneBtn = document.getElementById('salesTdsTcsNone');
    const tdsBtn = document.getElementById('salesTdsTcsTDS');
    const tcsBtn = document.getElementById('salesTdsTcsTCS');
    if (inv.tdsTcsMode === 'TDS' && tdsBtn) tdsBtn.click();
    else if (inv.tdsTcsMode === 'TCS' && tcsBtn) tcsBtn.click();
    else if (noneBtn) noneBtn.click();
    
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    const customInput = document.getElementById('salesTdsTcsRateCustom');
    const customWrap = document.getElementById('salesTdsTcsRateCustomWrap');
    const rateVal = inv.tdsTcsRate || 0;
    if (rateSelect) {
      if (rateSelect.querySelector(`option[value="${rateVal}"]`)) {
        rateSelect.value = String(rateVal);
        if (customWrap) customWrap.style.display = 'none';
      } else {
        rateSelect.value = 'custom';
        if (customInput) customInput.value = rateVal;
        if (customWrap) customWrap.style.display = 'block';
      }
    }
    
    currentSalesType = inv.type;
    const prodBtn = document.getElementById('salesTypeProduct');
    const servBtn = document.getElementById('salesTypeService');
    const typeBg = document.getElementById('salesTypeBg');
    if (inv.type === 'Product') {
      if (prodBtn) prodBtn.classList.add('active');
      if (servBtn) servBtn.classList.remove('active');
      if (typeBg) {
        typeBg.classList.add('prod-active');
        typeBg.classList.remove('serv-active');
      }
    } else {
      if (servBtn) servBtn.classList.add('active');
      if (prodBtn) prodBtn.classList.remove('active');
      if (typeBg) {
        typeBg.classList.add('serv-active');
        typeBg.classList.remove('prod-active');
      }
    }
    
    const remainingRows = getInvoiceRemainingRows(inv);
    salesRows = remainingRows.filter(row => {
      if (inv.type === 'Product') {
        return row.qty > 0;
      } else {
        return row.baseAmount > 0;
      }
    });
    salesRows.forEach(row => {
      row.origQty = row.qty;
      row.origRate = row.rate;
      row.origDiscount = row.discount;
      row.origDiscountType = row.discountType;
      row.origBaseAmount = row.baseAmount;
    });
    renderSalesRows();
    recalculateSalesTotals();
    updateSalesReturnLockState();
  }

  function refreshSalesOrderDropdownOptions(filter = '') {
    const optionsList = document.getElementById('salesOrderSelectOptionsList');
    const triggerText = document.getElementById('salesOrderSelectTriggerText');
    const orderEl = document.getElementById('salesOrderNo');
    if (!optionsList || !triggerText || !orderEl) return;

    optionsList.innerHTML = '';
    
    // Default "None" option
    const noneItem = document.createElement('div');
    noneItem.style.padding = '8px 12px';
    noneItem.style.fontSize = '13px';
    noneItem.style.borderRadius = '6px';
    noneItem.style.cursor = 'pointer';
    noneItem.style.fontWeight = '600';
    noneItem.style.color = 'var(--slate-500)';
    noneItem.textContent = 'None';
    
    noneItem.addEventListener('mouseover', () => {
      noneItem.style.background = 'var(--slate-50)';
    });
    noneItem.addEventListener('mouseout', () => {
      noneItem.style.background = 'transparent';
    });
    noneItem.addEventListener('click', () => {
      triggerText.textContent = 'None';
      orderEl.value = '';
      
      const dropdown = document.getElementById('salesOrderSelectDropdown');
      if (dropdown) dropdown.style.display = 'none';
      recalculateSalesTotals();
    });
    optionsList.appendChild(noneItem);

    // Get all posted sales orders (excluding those already converted to a posted sales invoice)
    const postedInvoices = (window.KYA_STORE.salesVouchers || []).filter(v => !v.isOrder && !v.isReturn);
    const convertedOrderNos = new Set(postedInvoices.map(inv => inv.orderNo).filter(no => !!no));
    const orders = (window.KYA_STORE.salesVouchers || []).filter(v => v.isOrder && !convertedOrderNos.has(v.invoiceNo));
    
    const query = filter.toLowerCase().trim();
    let matchCount = 0;
    
    orders.forEach(order => {
      const custName = order.customerId ? ((coaLedgers.find(l => l.id == order.customerId) || { name: 'Customer' }).name) : 'No Customer';
      const text = `${order.invoiceNo} - ${custName} (${order.date}) - ₹${fmtNum(order.total)}`;
      if (query && !text.toLowerCase().includes(query)) {
        return;
      }
      matchCount++;
      
      const item = document.createElement('div');
      item.style.padding = '8px 12px';
      item.style.fontSize = '13px';
      item.style.borderRadius = '6px';
      item.style.cursor = 'pointer';
      item.style.fontWeight = '500';
      item.style.color = 'var(--slate-700)';
      item.style.whiteSpace = 'nowrap';
      item.style.overflow = 'hidden';
      item.style.textOverflow = 'ellipsis';
      
      item.textContent = text;
      
      item.addEventListener('mouseover', () => {
        item.style.background = 'var(--slate-50)';
      });
      item.addEventListener('mouseout', () => {
        item.style.background = 'transparent';
      });
      
      item.addEventListener('click', () => {
        triggerText.textContent = order.invoiceNo;
        orderEl.value = order.invoiceNo;
        
        autoFillFormFromOrder(order);
        
        const dropdown = document.getElementById('salesOrderSelectDropdown');
        if (dropdown) dropdown.style.display = 'none';
      });
      
      optionsList.appendChild(item);
    });
    
    if (query && matchCount === 0) {
      const noResult = document.createElement('div');
      noResult.style.padding = '8px 12px';
      noResult.style.fontSize = '12px';
      noResult.style.color = 'var(--slate-400)';
      noResult.style.textAlign = 'center';
      noResult.textContent = 'No matching orders';
      optionsList.appendChild(noResult);
    }
  }

  function autoFillFormFromOrder(order) {
    const custEl = document.getElementById('salesCustomer');
    if (custEl) {
      custEl.value = order.customerId || '';
      populateSalesCustomers(order.customerId);
    }
    
    const execEl = document.getElementById('salesExecutive');
    if (execEl) {
      execEl.value = order.salesExecutiveId || '';
      populateSalesExecutives(order.salesExecutiveId);
    }
    
    const supplyTypeEl = document.getElementById('salesSupplyType');
    if (supplyTypeEl) {
      supplyTypeEl.value = order.salesSupplyType || 'Intra-State (CGST + SGST)';
    }
    
    const notesEl = document.getElementById('salesNotes');
    if (notesEl) {
      notesEl.value = order.notes || '';
    }
    
    const adjEl = document.getElementById('salesAdjustments');
    if (adjEl) {
      adjEl.value = order.adjustments || '';
    }
    
    const noneBtn = document.getElementById('salesTdsTcsNone');
    const tdsBtn = document.getElementById('salesTdsTcsTDS');
    const tcsBtn = document.getElementById('salesTdsTcsTCS');
    if (order.tdsTcsMode === 'TDS' && tdsBtn) tdsBtn.click();
    else if (order.tdsTcsMode === 'TCS' && tcsBtn) tcsBtn.click();
    else if (noneBtn) noneBtn.click();
    
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    const customInput = document.getElementById('salesTdsTcsRateCustom');
    const customWrap = document.getElementById('salesTdsTcsRateCustomWrap');
    const rateVal = order.tdsTcsRate || 0;
    if (rateSelect) {
      if (rateSelect.querySelector(`option[value="${rateVal}"]`)) {
        rateSelect.value = String(rateVal);
        if (customWrap) customWrap.style.display = 'none';
      } else {
        rateSelect.value = 'custom';
        if (customInput) customInput.value = rateVal;
        if (customWrap) customWrap.style.display = 'block';
      }
    }
    
    currentSalesType = order.type;
    const prodBtn = document.getElementById('salesTypeProduct');
    const servBtn = document.getElementById('salesTypeService');
    const typeBg = document.getElementById('salesTypeBg');
    if (order.type === 'Product') {
      if (prodBtn) prodBtn.classList.add('active');
      if (servBtn) servBtn.classList.remove('active');
      if (typeBg) {
        typeBg.classList.add('prod-active');
        typeBg.classList.remove('serv-active');
      }
    } else {
      if (servBtn) servBtn.classList.add('active');
      if (prodBtn) prodBtn.classList.remove('active');
      if (typeBg) {
        typeBg.classList.add('serv-active');
        typeBg.classList.remove('prod-active');
      }
    }
    
    // Copy rows
    salesRows = JSON.parse(JSON.stringify(order.rows));
    
    renderSalesRows();
    recalculateSalesTotals();
  }

  function initSalesForm() {
    updateVoucherSubtypeUI();
    const today = new Date().toISOString().split('T')[0];
    const dateEl = document.getElementById('salesDate');
    const dueEl = document.getElementById('salesDueDate');
    if (dateEl) dateEl.value = today;
    if (dueEl) dueEl.value = today;
    
    const orderEl = document.getElementById('salesOrderNo');
    const notesEl = document.getElementById('salesNotes');
    const adjEl = document.getElementById('salesAdjustments');
    if (orderEl) orderEl.value = '';
    const orderTriggerText = document.getElementById('salesOrderSelectTriggerText');
    if (orderTriggerText) orderTriggerText.textContent = 'None';
    if (notesEl) notesEl.value = '';
    if (adjEl) adjEl.value = '';
    
    const noneBtn = document.getElementById('salesTdsTcsNone');
    if (noneBtn) noneBtn.click();
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    const customInput = document.getElementById('salesTdsTcsRateCustom');
    const customWrap = document.getElementById('salesTdsTcsRateCustomWrap');
    const label = document.getElementById('salesTdsTcsRateLabel');
    const amt = document.getElementById('salesTdsTcsAmount');
    if (rateSelect) rateSelect.value = '1';
    if (customInput) customInput.value = '';
    if (customWrap) customWrap.style.display = 'none';
    if (label) label.textContent = '0%';
    if (amt) amt.value = '';
    
    populateSalesCustomers();
    populateSalesExecutives();
    const execEl = document.getElementById('salesExecutive');
    if (execEl) execEl.value = '';
    const supplyTypeEl = document.getElementById('salesSupplyType');
    if (supplyTypeEl) supplyTypeEl.value = 'Intra-State (CGST + SGST)';
    const notPaidBtn = document.getElementById('salesPaymentStatusNotPaid');
    if (notPaidBtn) notPaidBtn.click();
    const payAccEl = document.getElementById('salesPaymentAccount');
    if (payAccEl) payAccEl.value = '';
    const payAmtEl = document.getElementById('salesPaymentAmount');
    if (payAmtEl) payAmtEl.value = '';
    setInvoiceNoMode('Auto');
    
    currentSalesType = 'Product';
    const prodBtn = document.getElementById('salesTypeProduct');
    const servBtn = document.getElementById('salesTypeService');
    const typeBg = document.getElementById('salesTypeBg');
    if (prodBtn) prodBtn.classList.add('active');
    if (servBtn) servBtn.classList.remove('active');
    if (typeBg) {
      typeBg.classList.add('prod-active');
      typeBg.classList.remove('serv-active');
    }
    
    const triggerText = document.getElementById('salesInvoiceSelectTriggerText');
    if (triggerText) triggerText.textContent = 'Select Invoice';

    salesRows = [];
    addSalesRow();
    updateSalesReturnLockState();
  }

  function loadSalesInvoice(inv, isDraft) {
    openTab('sales_voucher');
    
    currentSalesVoucherSubtype = inv.isReturn ? 'Return' : (inv.isOrder ? 'Order' : 'Invoice');
    updateVoucherSubtypeUI();
    
    currentSalesType = inv.type;
    const prodBtn = document.getElementById('salesTypeProduct');
    const servBtn = document.getElementById('salesTypeService');
    const typeBg = document.getElementById('salesTypeBg');
    if (inv.type === 'Product') {
      if (prodBtn) prodBtn.classList.add('active');
      if (servBtn) servBtn.classList.remove('active');
      if (typeBg) {
        typeBg.classList.add('prod-active');
        typeBg.classList.remove('serv-active');
      }
    } else {
      if (servBtn) servBtn.classList.add('active');
      if (prodBtn) prodBtn.classList.remove('active');
      if (typeBg) {
        typeBg.classList.add('serv-active');
        typeBg.classList.remove('prod-active');
      }
    }
    
    setInvoiceNoMode(inv.mode || 'Manual');
    const invNoEl = document.getElementById('salesInvoiceNo');
    const chipEl = document.getElementById('salesVoucherChipDisplay');
    const triggerText = document.getElementById('salesInvoiceSelectTriggerText');
    if (invNoEl) invNoEl.value = inv.invoiceNo;
    if (chipEl) chipEl.textContent = inv.invoiceNo;
    if (triggerText && inv.isReturn) {
      let retAgainst = inv.returnAgainstInvoice;
      if (!retAgainst && inv.notes) {
        const match = inv.notes.match(/Return against invoice\s+([^\s\.]+)/i);
        if (match) retAgainst = match[1];
      }
      triggerText.textContent = retAgainst || 'Select Invoice';
    }
    
    const orderEl = document.getElementById('salesOrderNo');
    const dateEl = document.getElementById('salesDate');
    const dueEl = document.getElementById('salesDueDate');
    if (orderEl) orderEl.value = inv.orderNo || '';
    const orderTriggerText = document.getElementById('salesOrderSelectTriggerText');
    if (orderTriggerText) orderTriggerText.textContent = inv.orderNo || 'None';
    if (dateEl) dateEl.value = inv.date;
    if (dueEl) dueEl.value = inv.dueDate || inv.date;
    
    populateSalesCustomers(inv.customerId);
    populateSalesExecutives(inv.salesExecutiveId);
    const supplyTypeEl = document.getElementById('salesSupplyType');
    if (supplyTypeEl) supplyTypeEl.value = inv.salesSupplyType || 'Intra-State (CGST + SGST)';
    
    const notesEl = document.getElementById('salesNotes');
    if (notesEl) notesEl.value = inv.notes || '';
    
    const tdsTcsMode = inv.tdsTcsMode || 'None';
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    const customInput = document.getElementById('salesTdsTcsRateCustom');
    const customWrap = document.getElementById('salesTdsTcsRateCustomWrap');
    const label = document.getElementById('salesTdsTcsRateLabel');
    const amt = document.getElementById('salesTdsTcsAmount');
    
    const rateVal = inv.tdsTcsRate || 0;
    if (rateSelect) {
      const stdOptions = ['0', '0.1', '1', '2', '5', '10'];
      if (stdOptions.includes(String(rateVal))) {
        rateSelect.value = String(rateVal);
        if (customWrap) customWrap.style.display = 'none';
      } else {
        rateSelect.value = 'custom';
        if (customInput) customInput.value = rateVal;
        if (customWrap) customWrap.style.display = 'block';
      }
    }
    if (label) {
      label.textContent = (rateVal % 1 === 0 ? rateVal.toFixed(0) : (rateVal * 10 % 1 === 0 ? rateVal.toFixed(1) : rateVal.toFixed(2))) + '%';
    }
    if (amt) amt.value = inv.tdsTcsAmount !== undefined ? inv.tdsTcsAmount : '';
    
    if (tdsTcsMode === 'TDS') {
      const tdsBtn = document.getElementById('salesTdsTcsTds');
      if (tdsBtn) tdsBtn.click();
    } else if (tdsTcsMode === 'TCS') {
      const tcsBtn = document.getElementById('salesTdsTcsTcs');
      if (tcsBtn) tcsBtn.click();
    } else {
      const noneBtn = document.getElementById('salesTdsTcsNone');
      if (noneBtn) noneBtn.click();
    }
    
    const adjEl = document.getElementById('salesAdjustments');
    if (adjEl) adjEl.value = inv.adjustments !== undefined ? inv.adjustments : '';
    
    const payStatus = inv.paymentStatus || 'Not Paid';
    if (payStatus === 'Full Payment' || payStatus === 'Full Refund') {
      const fullBtn = document.getElementById('salesPaymentStatusFull');
      if (fullBtn) fullBtn.click();
    } else if (payStatus === 'Partial Payment' || payStatus === 'Partial Refund') {
      const partBtn = document.getElementById('salesPaymentStatusPartial');
      if (partBtn) partBtn.click();
    } else {
      const notPaidBtn = document.getElementById('salesPaymentStatusNotPaid');
      if (notPaidBtn) notPaidBtn.click();
    }
    populateSalesPaymentAccounts(inv.paymentAccountId);
    const payAmtEl = document.getElementById('salesPaymentAmount');
    if (payAmtEl) {
      if (payStatus === 'Partial Refund') {
        payAmtEl.value = inv.refundedAmount !== undefined ? inv.refundedAmount : '';
      } else {
        payAmtEl.value = inv.paymentAmount !== undefined ? inv.paymentAmount : '';
      }
    }
    
    salesRows = JSON.parse(JSON.stringify(inv.rows));
    if (inv.isReturn) {
      const orig = getOriginalInvoiceForReturn();
      if (orig) {
        const remainingRows = getInvoiceRemainingRows(orig, isDraft ? null : inv.id);
        salesRows.forEach((row, i) => {
          let match = null;
          if (inv.type === 'Product') {
            match = remainingRows.find(r => r.item === row.item);
          } else {
            match = remainingRows.find(r => r.revenueLedgerId == row.revenueLedgerId);
          }
          if (match) {
            row.origQty = match.qty;
            row.origRate = match.rate;
            row.origDiscount = match.discount;
            row.origDiscountType = match.discountType;
            row.origBaseAmount = match.baseAmount;
          } else {
            row.origQty = row.origQty !== undefined ? row.origQty : row.qty;
            row.origRate = row.origRate !== undefined ? row.origRate : row.rate;
            row.origDiscount = row.origDiscount !== undefined ? row.origDiscount : row.discount;
            row.origDiscountType = row.origDiscountType !== undefined ? row.origDiscountType : row.discountType;
            row.origBaseAmount = row.origBaseAmount !== undefined ? row.origBaseAmount : row.baseAmount;
          }
        });
      }
    }
    renderSalesRows();
    recalculateSalesTotals();
    
    window._editingSalesInvoice = { id: inv.id, isDraft: isDraft };
    updateSalesReturnLockState();
  }

  function saveSalesDraft() {
    if (currentSalesVoucherSubtype === 'Return') {
      const origInv = getOriginalInvoiceForReturn();
      if (!origInv) {
        showToast('Please select the original Invoice No. for this sales return.', 'warning');
        return;
      }
    }
    const customerId = document.getElementById('salesCustomer').value;
    const salesExecutiveId = document.getElementById('salesExecutive').value;
    const salesSupplyType = document.getElementById('salesSupplyType').value;
    const invoiceNo = document.getElementById('salesInvoiceNo').value.trim();
    const date = document.getElementById('salesDate').value;
    const dueDate = document.getElementById('salesDueDate').value;
    const orderNo = document.getElementById('salesOrderNo').value.trim();
    const notes = document.getElementById('salesNotes').value;
    const adjustments = parseFloat(document.getElementById('salesAdjustments').value) || 0;
    
    let tdsTcsMode = 'None';
    const tdsBtn = document.getElementById('salesTdsTcsTds');
    const tcsBtn = document.getElementById('salesTdsTcsTcs');
    if (tdsBtn && tdsBtn.classList.contains('active')) tdsTcsMode = 'TDS';
    if (tcsBtn && tcsBtn.classList.contains('active')) tdsTcsMode = 'TCS';
    
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    let tdsTcsRate = 0;
    if (rateSelect) {
      if (rateSelect.value === 'custom') {
        const customInput = document.getElementById('salesTdsTcsRateCustom');
        tdsTcsRate = customInput ? (parseFloat(customInput.value) || 0) : 0;
      } else {
        tdsTcsRate = parseFloat(rateSelect.value) || 0;
      }
    }
    const amtEl = document.getElementById('salesTdsTcsAmount');
    const tdsTcsAmount = amtEl ? (parseFloat(amtEl.value) || 0) : 0;
    
    const subTotal = calculateSubtotal();
    let total = subTotal;
    if (tdsTcsMode === 'TDS') total = subTotal - tdsTcsAmount;
    else if (tdsTcsMode === 'TCS') total = subTotal + tdsTcsAmount;
    total += adjustments;
    
    let paymentStatus = getSalesPaymentStatus();
    const paymentAccountId = document.getElementById('salesPaymentAccount').value;
    let paymentAmount = 0;
    
    let orderAdvanceAmount = 0;
    if (orderNo && currentSalesVoucherSubtype === 'Invoice') {
      const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
      if (linkedOrder) {
        if (linkedOrder.paymentStatus === 'Full Payment') {
          orderAdvanceAmount = linkedOrder.total;
        } else if (linkedOrder.paymentStatus === 'Partial Payment') {
          orderAdvanceAmount = linkedOrder.paymentAmount || 0;
        }
      }
    }
    const excessAmount = Math.max(0, orderAdvanceAmount - total);
    let refundedAmount = 0;
    if (excessAmount > 0) {
      if (paymentStatus === 'Full Refund') {
        refundedAmount = excessAmount;
      } else if (paymentStatus === 'Partial Refund') {
        refundedAmount = parseFloat(document.getElementById('salesPaymentAmount').value) || 0;
      } else {
        paymentStatus = 'Not Refunded';
        refundedAmount = 0;
      }
    } else {
      if (paymentStatus === 'Full Payment') {
        paymentAmount = getSalesPaymentMax(total);
      } else if (paymentStatus === 'Partial Payment') {
        paymentAmount = parseFloat(document.getElementById('salesPaymentAmount').value) || 0;
      }
    }

    if (currentSalesVoucherSubtype === 'Return') {
      const origInv = getOriginalInvoiceForReturn();
      if (origInv) {
        if (date < origInv.date) {
          showToast(`Return date cannot be before the sale date (${origInv.date}).`, 'warning');
          return;
        }
      }
    }

    const draftData = {
      id: (window._editingSalesInvoice && window._editingSalesInvoice.isDraft) ? window._editingSalesInvoice.id : Date.now(),
      type: currentSalesType,
      mode: currentSalesInvoiceMode,
      invoiceNo: invoiceNo || 'Draft',
      isReturn: currentSalesVoucherSubtype === 'Return',
      isOrder: currentSalesVoucherSubtype === 'Order',
      returnAgainstInvoice: currentSalesVoucherSubtype === 'Return' ? (document.getElementById('salesInvoiceSelectTriggerText')?.textContent.trim() || '') : '',
      customerId,
      salesExecutiveId,
      salesSupplyType,
      date,
      dueDate,
      orderNo,
      notes,
      tdsTcsMode,
      tdsTcsRate,
      tdsTcsAmount,
      adjustments,
      subTotal,
      total,
      paymentStatus,
      paymentAccountId,
      paymentAmount,
      excessAmount: excessAmount > 0 ? excessAmount : undefined,
      refundedAmount: excessAmount > 0 ? refundedAmount : undefined,
      rows: JSON.parse(JSON.stringify(salesRows)),
      updatedAt: Date.now()
    };
    
    window.KYA_STORE.salesVouchersDrafts = window.KYA_STORE.salesVouchersDrafts || [];
    
    const existingIndex = window.KYA_STORE.salesVouchersDrafts.findIndex(d => d.id === draftData.id);
    if (existingIndex > -1) {
      window.KYA_STORE.salesVouchersDrafts[existingIndex] = draftData;
    } else {
      window.KYA_STORE.salesVouchersDrafts.push(draftData);
    }
    
    let draftToastMsg = 'Sales Invoice Draft saved successfully.';
    if (currentSalesVoucherSubtype === 'Return') {
      draftToastMsg = 'Sales Return Draft saved successfully.';
    } else if (currentSalesVoucherSubtype === 'Order') {
      draftToastMsg = 'Sales Order Draft saved successfully.';
    }
    showToast(draftToastMsg, 'success');
    window._editingSalesInvoice = null;
    currentSalesVoucherSubtype = 'Invoice';
    initSalesForm();
    openTab('sales_drafted');
    triggerAutoBackup();
  }

  function postSalesInvoice() {
    if (currentSalesVoucherSubtype === 'Return') {
      const origInv = getOriginalInvoiceForReturn();
      if (!origInv) {
        showToast('Please select the original Invoice No. for this sales return.', 'warning');
        return;
      }
    }
    const customerId = document.getElementById('salesCustomer').value;
    const salesExecutiveId = document.getElementById('salesExecutive').value;
    const salesSupplyType = document.getElementById('salesSupplyType').value;
    if (!customerId) {
      showToast('Please select a Customer.', 'warning');
      return;
    }
    
    const invoiceNo = document.getElementById('salesInvoiceNo').value.trim();
    if (!invoiceNo) {
      let typeLabel = 'Invoice';
      if (currentSalesVoucherSubtype === 'Return') typeLabel = 'Return';
      else if (currentSalesVoucherSubtype === 'Order') typeLabel = 'Order';
      showToast(`${typeLabel} number is required.`, 'warning');
      return;
    }
    
    window.KYA_STORE.salesVouchers = window.KYA_STORE.salesVouchers || [];
    const dup = window.KYA_STORE.salesVouchers.some(v => {
      if (v.invoiceNo.toLowerCase() !== invoiceNo.toLowerCase()) return false;
      const isVReturn = !!v.isReturn;
      const isVOrder = !!v.isOrder;
      const isVInvoice = !v.isReturn && !v.isOrder;
      const isCurrentReturn = currentSalesVoucherSubtype === 'Return';
      const isCurrentOrder = currentSalesVoucherSubtype === 'Order';
      const isCurrentInvoice = currentSalesVoucherSubtype === 'Invoice';
      if (isCurrentReturn !== isVReturn) return false;
      if (isCurrentOrder !== isVOrder) return false;
      if (isCurrentInvoice !== isVInvoice) return false;
      if (window._editingSalesInvoice && !window._editingSalesInvoice.isDraft && v.id === window._editingSalesInvoice.id) {
        return false;
      }
      return true;
    });
    if (dup) {
      let typeLabel = 'Invoice';
      if (currentSalesVoucherSubtype === 'Return') typeLabel = 'Return';
      else if (currentSalesVoucherSubtype === 'Order') typeLabel = 'Order';
      showToast(`${typeLabel} No. "${invoiceNo}" has already been posted. Please use a unique number.`, 'danger');
      return;
    }
    
    if (salesRows.length === 0) {
      showToast('Please add at least one line item.', 'warning');
      return;
    }
    
    if (currentSalesType === 'Product') {
      const invalid = salesRows.some(r => !r.item.trim() || r.qty <= 0 || r.rate < 0);
      if (invalid) {
        showToast('Please ensure all items have descriptions, quantity > 0, and rate >= 0.', 'warning');
        return;
      }
    } else {
      const invalid = salesRows.some(r => !r.revenueLedgerId || r.baseAmount < 0);
      if (invalid) {
        showToast('Please ensure all items have a selected Revenue Account and base amount >= 0.', 'warning');
        return;
      }
    }
    
    if (currentSalesVoucherSubtype === 'Return') {
      for (let i = 0; i < salesRows.length; i++) {
        const r = salesRows[i];
        if (currentSalesType === 'Product') {
          if (r.origQty !== undefined && r.qty > r.origQty) {
            showToast(`Row ${i + 1}: Quantity exceeds remaining quantity of ${r.origQty}.`, 'warning');
            return;
          }
          if (r.origRate !== undefined && r.rate > r.origRate) {
            showToast(`Row ${i + 1}: Rate exceeds original invoice rate of ₹${fmtNum(r.origRate)}.`, 'warning');
            return;
          }
          if (r.origDiscount !== undefined && r.discount > r.origDiscount) {
            showToast(`Row ${i + 1}: Discount exceeds remaining discount.`, 'warning');
            return;
          }
        } else {
          if (r.origBaseAmount !== undefined && r.baseAmount > r.origBaseAmount) {
            showToast(`Row ${i + 1}: Base Amount exceeds remaining base amount of ₹${fmtNum(r.origBaseAmount)}.`, 'warning');
            return;
          }
          if (r.origDiscount !== undefined && r.discount > r.origDiscount) {
            showToast(`Row ${i + 1}: Discount exceeds remaining discount.`, 'warning');
            return;
          }
        }
      }
    }
    
    const date = document.getElementById('salesDate').value;
    if (currentSalesVoucherSubtype === 'Return') {
      const origInv = getOriginalInvoiceForReturn();
      if (origInv) {
        if (date < origInv.date) {
          showToast(`Return date cannot be before the sale date (${origInv.date}).`, 'warning');
          return;
        }
      }
    }
    const dueDate = document.getElementById('salesDueDate').value;
    const orderNo = document.getElementById('salesOrderNo').value.trim();
    const notes = document.getElementById('salesNotes').value;
    const adjustments = parseFloat(document.getElementById('salesAdjustments').value) || 0;
    
    let tdsTcsMode = 'None';
    const tdsBtn = document.getElementById('salesTdsTcsTds');
    const tcsBtn = document.getElementById('salesTdsTcsTcs');
    if (tdsBtn && tdsBtn.classList.contains('active')) tdsTcsMode = 'TDS';
    if (tcsBtn && tcsBtn.classList.contains('active')) tdsTcsMode = 'TCS';
    
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    let tdsTcsRate = 0;
    if (rateSelect) {
      if (rateSelect.value === 'custom') {
        const customInput = document.getElementById('salesTdsTcsRateCustom');
        tdsTcsRate = customInput ? (parseFloat(customInput.value) || 0) : 0;
      } else {
        tdsTcsRate = parseFloat(rateSelect.value) || 0;
      }
    }
    const amtEl = document.getElementById('salesTdsTcsAmount');
    const tdsTcsAmount = amtEl ? (parseFloat(amtEl.value) || 0) : 0;
    
    const subTotal = calculateSubtotal();
    let total = subTotal;
    if (tdsTcsMode === 'TDS') total = subTotal - tdsTcsAmount;
    else if (tdsTcsMode === 'TCS') total = subTotal + tdsTcsAmount;
    total += adjustments;
    
    let paymentStatus = getSalesPaymentStatus();
    const paymentAccountId = document.getElementById('salesPaymentAccount').value;
    let paymentAmount = 0;
    
    let orderAdvanceAmount = 0;
    if (orderNo && currentSalesVoucherSubtype === 'Invoice') {
      const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
      if (linkedOrder) {
        if (linkedOrder.paymentStatus === 'Full Payment') {
          orderAdvanceAmount = linkedOrder.total;
        } else if (linkedOrder.paymentStatus === 'Partial Payment') {
          orderAdvanceAmount = linkedOrder.paymentAmount || 0;
        }
      }
    }
    const excessAmount = Math.max(0, orderAdvanceAmount - total);
    let refundedAmount = 0;
    let refundJournalEntryIds = [];
    if (excessAmount > 0) {
      if (window._editingSalesInvoice && !window._editingSalesInvoice.isDraft) {
        const oldInv = (window.KYA_STORE.salesVouchers || []).find(v => v.id === window._editingSalesInvoice.id);
        if (oldInv) {
          refundedAmount = oldInv.refundedAmount || 0;
          refundJournalEntryIds = oldInv.refundJournalEntryIds || [];
        }
      }
      
      if (paymentStatus === 'Full Refund') {
        if (!paymentAccountId) {
          showToast('Please select a Payment Account for the refund.', 'warning');
          return;
        }
        refundedAmount = excessAmount;
      } else if (paymentStatus === 'Partial Refund') {
        if (!paymentAccountId) {
          showToast('Please select a Payment Account for the refund.', 'warning');
          return;
        }
        const refundAmt = parseFloat(document.getElementById('salesPaymentAmount').value) || 0;
        if (refundAmt <= 0) {
          showToast('Refund Amount must be greater than zero for Partial Refunds.', 'warning');
          return;
        }
        if (refundAmt > excessAmount) {
          showToast(`Refund Amount cannot exceed the excess amount of ₹${fmtNum(excessAmount)}.`, 'warning');
          return;
        }
        if (refundAmt === excessAmount) {
          paymentStatus = 'Full Refund';
          refundedAmount = excessAmount;
        } else {
          refundedAmount = refundAmt;
        }
      } else {
        paymentStatus = 'Not Refunded';
        refundedAmount = 0;
      }
    } else {
      if (paymentStatus !== 'Not Paid') {
        if (!paymentAccountId) {
          showToast('Please select a Payment Account.', 'warning');
          return;
        }
        if (paymentStatus === 'Full Payment') {
          paymentAmount = getSalesPaymentMax(total);
        } else if (paymentStatus === 'Partial Payment') {
          paymentAmount = parseFloat(document.getElementById('salesPaymentAmount').value) || 0;
          if (paymentAmount <= 0) {
            showToast('Payment Amount must be greater than zero for Partial Payments.', 'warning');
            return;
          }
          const maxVal = getSalesPaymentMax(total);
          if (paymentAmount > maxVal) {
            const limitMsg = (currentSalesVoucherSubtype === 'Invoice' && orderNo)
              ? `Payment Amount cannot exceed the balance payment of ₹${fmtNum(maxVal)}.`
              : `Payment Amount cannot exceed the Grand Total of ₹${fmtNum(maxVal)}.`;
            showToast(limitMsg, 'warning');
            return;
          }
          if (currentSalesVoucherSubtype === 'Return') {
            const origInv = getOriginalInvoiceForReturn();
            if (origInv) {
              let origPaidAmt = 0;
              if (origInv.paymentStatus === 'Full Payment') {
                origPaidAmt = origInv.total;
              } else if (origInv.paymentStatus === 'Partial Payment') {
                origPaidAmt = origInv.paymentAmount || 0;
              }
              if (paymentAmount > origPaidAmt) {
                showToast(`Payment Amount cannot exceed the original invoice paid amount of ₹${fmtNum(origPaidAmt)}.`, 'warning');
                return;
              }
            }
          }
        }
      }
    }

    const isEditPosted = window._editingSalesInvoice && !window._editingSalesInvoice.isDraft;
    const existingJournalEntryId = isEditPosted ? (window.KYA_STORE.salesVouchers.find(v => v.id === window._editingSalesInvoice.id)?.journalEntryId) : null;

    if (isEditPosted) {
      const oldInv = window.KYA_STORE.salesVouchers.find(v => v.id === window._editingSalesInvoice.id);
      if (oldInv && oldInv.refundJournalEntryIds) {
        postedEntries = postedEntries.filter(e => !oldInv.refundJournalEntryIds.includes(e.id));
      }
    }

    const isOrderWithPayment = currentSalesVoucherSubtype === 'Order' && (paymentStatus === 'Full Payment' || paymentStatus === 'Partial Payment') && paymentAmount > 0;

    const journalEntryId = (currentSalesVoucherSubtype === 'Order' && !isOrderWithPayment) ? null : postSalesVoucherToJournal({
      invoiceNo,
      isReturn: currentSalesVoucherSubtype === 'Return',
      isOrder: currentSalesVoucherSubtype === 'Order',
      customerId,
      salesExecutiveId,
      salesSupplyType,
      date,
      dueDate,
      orderNo,
      notes,
      tdsTcsMode,
      tdsTcsRate,
      tdsTcsAmount,
      adjustments,
      subTotal,
      total,
      paymentStatus,
      paymentAccountId,
      paymentAmount,
      rows: salesRows,
      type: currentSalesType,
      journalEntryId: existingJournalEntryId
    });

    if (isEditPosted && existingJournalEntryId && !journalEntryId) {
      postedEntries = postedEntries.filter(e => e.id !== existingJournalEntryId);
    }

    if (excessAmount > 0 && (paymentStatus === 'Full Refund' || paymentStatus === 'Partial Refund')) {
      const refundAmt = refundedAmount;
      if (refundAmt > 0) {
        const refundEntryId = Date.now() + 1;
        const payAccount = coaLedgers.find(l => l.id == paymentAccountId);
        const payAccountName = payAccount ? payAccount.name : 'Cash Account';
        
        const refundLedgerId = getOrCreateSystemLedger('Refund Payable', 'sg-ocl');
        const refundLedgerName = coaLedgers.find(l => l.id == refundLedgerId).name;
        
        const refundRows = [
          {
            id: 1,
            type: 'By',
            particular: refundLedgerName,
            debit: refundAmt.toFixed(2),
            credit: ''
          },
          {
            id: 2,
            type: 'To',
            particular: payAccountName,
            debit: '',
            credit: refundAmt.toFixed(2)
          }
        ];
        
        const customer = coaLedgers.find(l => l.id == customerId);
        const customerName = customer ? customer.name : 'Unknown Customer';
        
        const refundEntry = {
          id:             refundEntryId,
          date:           date,
          voucherNo:      `RF-${invoiceNo}`,
          preparedBy:     'Sales Module',
          departmentId:   '',
          isBudget:       false,
          firstParticular: refundLedgerName,
          amount:         fmtNum(refundAmt),
          allRows:        refundRows,
          narration:      `Refund of overpaid advance of ₹${fmtNum(refundAmt)} processed against Sales Invoice ${invoiceNo} for customer ${customerName}. paid via ${payAccountName}.`
        };
        
        postedEntries.unshift(refundEntry);
        refundJournalEntryIds = [refundEntryId];
      }
    }
    
    const invoiceData = {
      id: isEditPosted ? window._editingSalesInvoice.id : Date.now(),
      type: currentSalesType,
      invoiceNo,
      isReturn: currentSalesVoucherSubtype === 'Return',
      isOrder: currentSalesVoucherSubtype === 'Order',
      returnAgainstInvoice: currentSalesVoucherSubtype === 'Return' ? (document.getElementById('salesInvoiceSelectTriggerText')?.textContent.trim() || '') : '',
      customerId,
      salesExecutiveId,
      salesSupplyType,
      date,
      dueDate,
      orderNo,
      notes,
      tdsTcsMode,
      tdsTcsRate,
      tdsTcsAmount,
      adjustments,
      subTotal,
      total,
      paymentStatus,
      paymentAccountId,
      paymentAmount,
      excessAmount: excessAmount > 0 ? excessAmount : undefined,
      refundedAmount: excessAmount > 0 ? refundedAmount : undefined,
      refundJournalEntryIds: excessAmount > 0 ? refundJournalEntryIds : undefined,
      rows: JSON.parse(JSON.stringify(salesRows)),
      journalEntryId,
      postedAt: isEditPosted ? (window.KYA_STORE.salesVouchers.find(v => v.id === window._editingSalesInvoice.id)?.postedAt || Date.now()) : Date.now()
    };
    
    if (window._editingSalesInvoice && window._editingSalesInvoice.isDraft) {
      window.KYA_STORE.salesVouchersDrafts = window.KYA_STORE.salesVouchersDrafts.filter(d => d.id !== window._editingSalesInvoice.id);
    }
    
    if (isEditPosted) {
      const idx = window.KYA_STORE.salesVouchers.findIndex(v => v.id === window._editingSalesInvoice.id);
      if (idx > -1) {
        window.KYA_STORE.salesVouchers[idx] = invoiceData;
      } else {
        window.KYA_STORE.salesVouchers.push(invoiceData);
      }
    } else {
      window.KYA_STORE.salesVouchers.push(invoiceData);
    }
    
    if (currentSalesInvoiceMode === 'Auto' && !isEditPosted) {
      if (currentSalesVoucherSubtype === 'Return') {
        window.KYA_STORE.salesReturnCtr = (window.KYA_STORE.salesReturnCtr || 1) + 1;
      } else if (currentSalesVoucherSubtype === 'Order') {
        window.KYA_STORE.salesOrderCtr = (window.KYA_STORE.salesOrderCtr || 1) + 1;
      } else {
        window.KYA_STORE.salesInvoiceCtr = (window.KYA_STORE.salesInvoiceCtr || 1) + 1;
      }
    }
    
    let successMsg = `Invoice "${invoiceNo}" posted successfully.`;
    if (currentSalesVoucherSubtype === 'Return') {
      successMsg = `Sales Return "${invoiceNo}" posted successfully.`;
    } else if (currentSalesVoucherSubtype === 'Order') {
      successMsg = `Sales Order "${invoiceNo}" placed successfully.`;
    }
    showToast(successMsg, 'success');
    window._editingSalesInvoice = null;
    currentSalesVoucherSubtype = 'Invoice';
    initSalesForm();
    openTab('sales_voucher');
    triggerAutoBackup();
  }

  function postSalesVoucherToJournal(invoice) {
    const customer = coaLedgers.find(l => l.id == invoice.customerId);
    const customerName = customer ? customer.name : 'Unknown Customer';
    
    const journalRows = [];
    
    let paidAmount = 0;
    let orderAdvanceAmount = 0;
    const isRet = !!invoice.isReturn;
    const isOrd = !!invoice.isOrder;
    
    if (!isRet && !isOrd && invoice.orderNo) {
      const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === invoice.orderNo.toLowerCase());
      if (linkedOrder) {
        if (linkedOrder.paymentStatus === 'Full Payment') {
          orderAdvanceAmount = linkedOrder.total;
        } else if (linkedOrder.paymentStatus === 'Partial Payment') {
          orderAdvanceAmount = linkedOrder.paymentAmount || 0;
        }
      }
    }
    
    if (invoice.paymentStatus === 'Full Payment') {
      paidAmount = Math.max(0, invoice.total - orderAdvanceAmount);
    } else if (invoice.paymentStatus === 'Partial Payment') {
      paidAmount = invoice.paymentAmount || 0;
    } else if (invoice.paymentStatus === 'Not Refunded' || invoice.paymentStatus === 'Partial Refund' || invoice.paymentStatus === 'Full Refund') {
      paidAmount = 0;
    }
    const unpaidAmount = invoice.total - paidAmount;
    
    if (isOrd) {
      if (paidAmount > 0) {
        const payAccount = coaLedgers.find(l => l.id == invoice.paymentAccountId);
        const payAccountName = payAccount ? payAccount.name : 'Cash Account';
        
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: payAccountName,
          debit: paidAmount.toFixed(2),
          credit: ''
        });
        
        const advanceLedgerId = getOrCreateSystemLedger('Advance from Customers', 'sg-ocl');
        const advanceLedgerName = coaLedgers.find(l => l.id == advanceLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'To',
          particular: advanceLedgerName,
          debit: '',
          credit: paidAmount.toFixed(2)
        });
      }
    } else if (isRet) {
      // SALES RETURN JOURNAL ENTRIES (Debit Sales Returns & tax, Credit Customer/Cash)
      if (unpaidAmount > 0) {
        journalRows.push({
          id: journalRows.length + 1,
          type: 'To',
          particular: customerName,
          debit: '',
          credit: unpaidAmount.toFixed(2)
        });
      }
      
      if (paidAmount > 0) {
        const payAccount = coaLedgers.find(l => l.id == invoice.paymentAccountId);
        const payAccountName = payAccount ? payAccount.name : 'Cash Account';
        
        journalRows.push({
          id: journalRows.length + 1,
          type: 'To',
          particular: payAccountName,
          debit: '',
          credit: paidAmount.toFixed(2)
        });
      }
      
      if (invoice.tdsTcsMode === 'TDS' && invoice.tdsTcsAmount > 0) {
        const tdsLedgerId = getOrCreateSystemLedger('TDS Receivable', 'sg-stla');
        const tdsName = coaLedgers.find(l => l.id == tdsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'To',
          particular: tdsName,
          debit: '',
          credit: invoice.tdsTcsAmount.toFixed(2)
        });
      }
      
      if (invoice.adjustments < 0) {
        const adjustmentsLedgerId = getOrCreateSystemLedger('Adjustments Account', 'sg-oe');
        const adjName = coaLedgers.find(l => l.id == adjustmentsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'To',
          particular: adjName,
          debit: '',
          credit: Math.abs(invoice.adjustments).toFixed(2)
        });
      }
      
      if (invoice.type === 'Product') {
        let totalRevenue = 0;
        invoice.rows.forEach(r => {
          const base = r.qty * r.rate;
          const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
          totalRevenue += Math.max(0, base - discAmt);
        });
        if (totalRevenue > 0) {
          const salesReturnLedgerId = getOrCreateSystemLedger('Sales Returns', 'sg-rfo');
          const salesReturnName = coaLedgers.find(l => l.id == salesReturnLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'By',
            particular: salesReturnName,
            debit: totalRevenue.toFixed(2),
            credit: ''
          });
        }
      } else {
        const revenueByLedger = {};
        invoice.rows.forEach(r => {
          const base = r.baseAmount;
          const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
          const amt = Math.max(0, base - discAmt);
          revenueByLedger[r.revenueLedgerId] = (revenueByLedger[r.revenueLedgerId] || 0) + amt;
        });
        for (const ledgId in revenueByLedger) {
          const revAmt = revenueByLedger[ledgId];
          if (revAmt > 0) {
            const ledgerName = (coaLedgers.find(l => l.id == ledgId) || { name: 'Revenue' }).name;
            journalRows.push({
              id: journalRows.length + 1,
              type: 'By',
              particular: ledgerName,
              debit: revAmt.toFixed(2),
              credit: ''
            });
          }
        }
      }
      
      let totalGst = 0;
      invoice.rows.forEach(r => {
        const base = invoice.type === 'Product' ? (r.qty * r.rate) : r.baseAmount;
        const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
        const afterDiscount = Math.max(0, base - discAmt);
        totalGst += afterDiscount * (r.tax / 100);
      });
      if (totalGst > 0) {
        const supplyType = invoice.salesSupplyType || 'Intra-State (CGST + SGST)';
        if (supplyType === 'Intra-State (CGST + SGST)' || supplyType === 'Deemed Export') {
          const cgstAmt = totalGst / 2;
          const sgstAmt = totalGst / 2;
          
          const cgstLedgerId = getOrCreateSystemLedger('Output CGST', 'sg-ocl');
          const cgstName = coaLedgers.find(l => l.id == cgstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'By',
            particular: cgstName,
            debit: cgstAmt.toFixed(2),
            credit: ''
          });
          
          const sgstLedgerId = getOrCreateSystemLedger('Output SGST', 'sg-ocl');
          const sgstName = coaLedgers.find(l => l.id == sgstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'By',
            particular: sgstName,
            debit: sgstAmt.toFixed(2),
            credit: ''
          });
        } else if (supplyType === 'Inter-State (IGST)' || supplyType === 'SEZ With Tax') {
          const igstLedgerId = getOrCreateSystemLedger('Output IGST', 'sg-ocl');
          const igstName = coaLedgers.find(l => l.id == igstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'By',
            particular: igstName,
            debit: totalGst.toFixed(2),
            credit: ''
          });
        } else {
          const gstLedgerId = getOrCreateSystemLedger('GST Payable', 'sg-ocl');
          const gstName = coaLedgers.find(l => l.id == gstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'By',
            particular: gstName,
            debit: totalGst.toFixed(2),
            credit: ''
          });
        }
      }
      
      if (invoice.tdsTcsMode === 'TCS' && invoice.tdsTcsAmount > 0) {
        const tcsLedgerId = getOrCreateSystemLedger('TCS Payable', 'sg-ocl');
        const tcsName = coaLedgers.find(l => l.id == tcsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: tcsName,
          debit: invoice.tdsTcsAmount.toFixed(2),
          credit: ''
        });
      }
      
      if (invoice.adjustments > 0) {
        const adjustmentsLedgerId = getOrCreateSystemLedger('Adjustments Account', 'sg-oe');
        const adjName = coaLedgers.find(l => l.id == adjustmentsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: adjName,
          debit: invoice.adjustments.toFixed(2),
          credit: ''
        });
      }
    } else {
      // ORIGINAL SALES INVOICE Posting (existing code)
      if (unpaidAmount > 0) {
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: customerName,
          debit: unpaidAmount.toFixed(2),
          credit: ''
        });
      }
      
      if (paidAmount > 0) {
        const payAccount = coaLedgers.find(l => l.id == invoice.paymentAccountId);
        const payAccountName = payAccount ? payAccount.name : 'Cash Account';
        
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: payAccountName,
          debit: paidAmount.toFixed(2),
          credit: ''
        });
      }
      
      if (invoice.tdsTcsMode === 'TDS' && invoice.tdsTcsAmount > 0) {
        const tdsLedgerId = getOrCreateSystemLedger('TDS Receivable', 'sg-stla');
        const tdsName = coaLedgers.find(l => l.id == tdsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: tdsName,
          debit: invoice.tdsTcsAmount.toFixed(2),
          credit: ''
        });
      }
      
      if (invoice.adjustments < 0) {
        const adjustmentsLedgerId = getOrCreateSystemLedger('Adjustments Account', 'sg-oe');
        const adjName = coaLedgers.find(l => l.id == adjustmentsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: adjName,
          debit: Math.abs(invoice.adjustments).toFixed(2),
          credit: ''
        });
      }
      
      if (invoice.type === 'Product') {
        let totalRevenue = 0;
        invoice.rows.forEach(r => {
          const base = r.qty * r.rate;
          const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
          totalRevenue += Math.max(0, base - discAmt);
        });
        if (totalRevenue > 0) {
          const salesLedgerId = getOrCreateSystemLedger('Sales Account', 'sg-rfo');
          const salesName = coaLedgers.find(l => l.id == salesLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'To',
            particular: salesName,
            debit: '',
            credit: totalRevenue.toFixed(2)
          });
        }
      } else {
        const revenueByLedger = {};
        invoice.rows.forEach(r => {
          const base = r.baseAmount;
          const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
          const amt = Math.max(0, base - discAmt);
          revenueByLedger[r.revenueLedgerId] = (revenueByLedger[r.revenueLedgerId] || 0) + amt;
        });
        for (const ledgId in revenueByLedger) {
          const revAmt = revenueByLedger[ledgId];
          if (revAmt > 0) {
            const ledgerName = (coaLedgers.find(l => l.id == ledgId) || { name: 'Revenue' }).name;
            journalRows.push({
              id: journalRows.length + 1,
              type: 'To',
              particular: ledgerName,
              debit: '',
              credit: revAmt.toFixed(2)
            });
          }
        }
      }
      
      let totalGst = 0;
      invoice.rows.forEach(r => {
        const base = invoice.type === 'Product' ? (r.qty * r.rate) : r.baseAmount;
        const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
        const afterDiscount = Math.max(0, base - discAmt);
        totalGst += afterDiscount * (r.tax / 100);
      });
      if (totalGst > 0) {
        const supplyType = invoice.salesSupplyType || 'Intra-State (CGST + SGST)';
        if (supplyType === 'Intra-State (CGST + SGST)' || supplyType === 'Deemed Export') {
          const cgstAmt = totalGst / 2;
          const sgstAmt = totalGst / 2;
          
          const cgstLedgerId = getOrCreateSystemLedger('Output CGST', 'sg-ocl');
          const cgstName = coaLedgers.find(l => l.id == cgstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'To',
            particular: cgstName,
            debit: '',
            credit: cgstAmt.toFixed(2)
          });
          
          const sgstLedgerId = getOrCreateSystemLedger('Output SGST', 'sg-ocl');
          const sgstName = coaLedgers.find(l => l.id == sgstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'To',
            particular: sgstName,
            debit: '',
            credit: sgstAmt.toFixed(2)
          });
        } else if (supplyType === 'Inter-State (IGST)' || supplyType === 'SEZ With Tax') {
          const igstLedgerId = getOrCreateSystemLedger('Output IGST', 'sg-ocl');
          const igstName = coaLedgers.find(l => l.id == igstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'To',
            particular: igstName,
            debit: '',
            credit: totalGst.toFixed(2)
          });
        } else {
          const gstLedgerId = getOrCreateSystemLedger('GST Payable', 'sg-ocl');
          const gstName = coaLedgers.find(l => l.id == gstLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'To',
            particular: gstName,
            debit: '',
            credit: totalGst.toFixed(2)
          });
        }
      }
      
      if (invoice.tdsTcsMode === 'TCS' && invoice.tdsTcsAmount > 0) {
        const tcsLedgerId = getOrCreateSystemLedger('TCS Payable', 'sg-ocl');
        const tcsName = coaLedgers.find(l => l.id == tcsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'To',
          particular: tcsName,
          debit: '',
          credit: invoice.tdsTcsAmount.toFixed(2)
        });
      }
      
      if (invoice.adjustments > 0) {
        const adjustmentsLedgerId = getOrCreateSystemLedger('Adjustments Account', 'sg-oe');
        const adjName = coaLedgers.find(l => l.id == adjustmentsLedgerId).name;
        journalRows.push({
          id: journalRows.length + 1,
          type: 'To',
          particular: adjName,
          debit: '',
          credit: invoice.adjustments.toFixed(2)
        });
      }

      // Check if this invoice is linked to a sales order that had advance payment
      let orderAdvanceAmount = 0;
      if (invoice.orderNo) {
        const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === invoice.orderNo.toLowerCase());
        if (linkedOrder) {
          if (linkedOrder.paymentStatus === 'Full Payment') {
            orderAdvanceAmount = linkedOrder.total;
          } else if (linkedOrder.paymentStatus === 'Partial Payment') {
            orderAdvanceAmount = linkedOrder.paymentAmount || 0;
          }
        }
      }
      if (orderAdvanceAmount > 0) {
        const advanceLedgerId = getOrCreateSystemLedger('Advance from Customers', 'sg-ocl');
        const advanceLedgerName = coaLedgers.find(l => l.id == advanceLedgerId).name;
        
        // Debit: Advance from Customers (By)
        journalRows.push({
          id: journalRows.length + 1,
          type: 'By',
          particular: advanceLedgerName,
          debit: orderAdvanceAmount.toFixed(2),
          credit: ''
        });
        
        const settledAmount = Math.min(invoice.total, orderAdvanceAmount);
        const excessAmount = Math.max(0, orderAdvanceAmount - invoice.total);
        
        if (settledAmount > 0) {
          // Credit: Customer Account (To)
          journalRows.push({
            id: journalRows.length + 1,
            type: 'To',
            particular: customerName,
            debit: '',
            credit: settledAmount.toFixed(2)
          });
        }
        
        if (excessAmount > 0) {
          // Credit: Refund Payable (To)
          const refundLedgerId = getOrCreateSystemLedger('Refund Payable', 'sg-ocl');
          const refundLedgerName = coaLedgers.find(l => l.id == refundLedgerId).name;
          journalRows.push({
            id: journalRows.length + 1,
            type: 'To',
            particular: refundLedgerName,
            debit: '',
            credit: excessAmount.toFixed(2)
          });
        }
      }
    }
    
    let execText = '';
    if (invoice.salesExecutiveId) {
      const execEmp = ohEmployees.find(e => e.id == invoice.salesExecutiveId);
      if (execEmp) {
        execText = ` Sales Executive: ${execEmp.name}.`;
      }
    }

    const entryId = invoice.journalEntryId || Date.now();
    const entry = {
      id:             entryId,
      date:           invoice.date,
      voucherNo:      isRet ? `SR-${invoice.invoiceNo}` : (isOrd ? `SO-${invoice.invoiceNo}` : `SV-${invoice.invoiceNo}`),
      preparedBy:     'Sales Module',
      departmentId:   '',
      isBudget:       false,
      firstParticular: customerName,
      amount:         isOrd ? fmtNum(paidAmount) : fmtNum(invoice.total),
      allRows:        journalRows,
      narration:      isOrd
        ? `Advance received against Sales Order No. ${invoice.invoiceNo} from customer ${customerName}.${execText} ${invoice.notes || ''}`
        : (isRet
          ? `Sales Return No. ${invoice.invoiceNo} posted for customer ${customerName}.${execText} ${invoice.notes || ''}`
          : `Sales Invoice No. ${invoice.invoiceNo} posted for customer ${customerName}.${execText} ${invoice.notes || ''}`),
    };
    
    if (invoice.journalEntryId) {
      const idx = postedEntries.findIndex(e => e.id === invoice.journalEntryId);
      if (idx > -1) {
        postedEntries[idx] = entry;
      } else {
        postedEntries.unshift(entry);
      }
    } else {
      postedEntries.unshift(entry);
    }
    refreshAllReports();
    return entryId;
  }

  function renderSalesPostedPanel() {
    const wrap = document.getElementById('salesPostedTableWrap');
    if (!wrap) return;
    
    const list = window.KYA_STORE.salesVouchers || [];
    if (list.length === 0) {
      wrap.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--slate-400);">
          <div style="font-size: 40px; margin-bottom: 12px;">📄</div>
          <div style="font-weight: 600; font-size: 15px; color: var(--slate-500);">No Posted Invoices Yet</div>
          <p style="font-size: 13px; margin: 4px 0 16px;">Post a Sales Voucher to see it here.</p>
          <button class="btn btn-primary" onclick="currentSalesVoucherSubtype = 'Invoice'; window._editingSalesInvoice = null; initSalesForm(); openTab('sales_voucher');">Create Invoice</button>
        </div>
      `;
      return;
    }
    
    const sorted = [...list].sort((a,b) => b.postedAt - a.postedAt);
    
    let rowsHtml = sorted.map(inv => {
      const custName = (coaLedgers.find(l => l.id == inv.customerId) || { name: 'Unknown Customer' }).name;
      let execName = '&mdash;';
      if (inv.salesExecutiveId) {
        const execEmp = ohEmployees.find(e => e.id == inv.salesExecutiveId);
        if (execEmp) execName = execEmp.name;
      }
      const isRet = !!inv.isReturn;
      const isOrd = !!inv.isOrder;
      
      let badgeHtml = '';
      if (isRet) {
        badgeHtml = `<span class="badge" style="background: var(--red-50); color: var(--red-700); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px;">Return</span>`;
      } else if (isOrd) {
        badgeHtml = `<span class="badge" style="background: var(--emerald-50); color: var(--emerald-700); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px;">Order</span>`;
      } else {
        badgeHtml = `<span class="badge" style="background: var(--blue-50); color: var(--blue-700); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px;">Invoice</span>`;
      }
      
      let totalColor = 'var(--slate-900)';
      if (isRet) totalColor = '#dc2626';
      else if (isOrd) totalColor = 'var(--emerald-700)';

      let statusBadgeHtml = '&mdash;';
      if (!isOrd) {
        let statusText = inv.paymentStatus || 'Not Paid';
        let bg = 'var(--slate-100)';
        let fg = 'var(--slate-700)';
        if (statusText === 'Full Payment' || statusText === 'Full Refund') {
          bg = 'var(--emerald-50)';
          fg = 'var(--emerald-700)';
        } else if (statusText === 'Partial Payment' || statusText === 'Partial Refund') {
          bg = 'var(--amber-50)';
          fg = 'var(--amber-700)';
        } else if (statusText === 'Not Refunded') {
          bg = 'var(--red-50)';
          fg = 'var(--red-700)';
        }
        statusBadgeHtml = `<span class="badge" style="background: ${bg}; color: ${fg}; font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px;">${statusText}</span>`;
      }

      let refundBtnHtml = '';
      if (!isOrd && !isRet && (inv.paymentStatus === 'Not Refunded' || inv.paymentStatus === 'Partial Refund')) {
        refundBtnHtml = `<button class="btn btn-success btn-sm" onclick="openRefundModal(${inv.id})" style="padding: 6px 12px; font-size: 12px; background: var(--emerald-50); color: var(--emerald-600); border: 1.5px solid var(--emerald-100); font-weight: 600;">Refund</button>`;
      }

      return `
        <tr class="sales-row">
          <td style="padding: 14px 16px; font-weight: 700; color: var(--blue-700);">${ohEsc(inv.invoiceNo)}</td>
          <td style="padding: 14px 16px;">${inv.date}</td>
          <td style="padding: 14px 16px; font-weight: 600;">${ohEsc(custName)}</td>
          <td style="padding: 14px 16px; color: var(--slate-600);">${ohEsc(execName)}</td>
          <td style="padding: 14px 16px; color: var(--slate-500); font-size: 12.5px;">${ohEsc(inv.salesSupplyType || 'Intra-State (CGST + SGST)')}</td>
          <td style="padding: 14px 16px;">
            ${badgeHtml}
            <span class="badge" style="background: var(--slate-100); color: var(--slate-700); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px;">${inv.type}</span>
          </td>
          <td style="padding: 14px 16px;">
            ${statusBadgeHtml}
          </td>
          <td style="padding: 14px 16px; text-align: right; font-weight: 700; color: ${totalColor};">₹ ${fmtNum(inv.total)}</td>
          <td style="padding: 14px 16px; text-align: center; display: flex; gap: 8px; justify-content: center;">
            ${refundBtnHtml}
            <button class="btn btn-secondary btn-sm" onclick="loadSalesInvoice((window.KYA_STORE.salesVouchers || []).find(v => v.id === ${inv.id}), false)" style="padding: 6px 12px; font-size: 12px; border: 1.5px solid var(--blue-200); color: var(--blue-600); background: #fff;">Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="viewPrintInvoice(${inv.id})" style="padding: 6px 12px; font-size: 12px;">View / Print</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSalesInvoice(${inv.id})" style="padding: 6px 12px; font-size: 12px; background: var(--red-50); color: var(--red-600); border: 1.5px solid var(--red-100);">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
    
    wrap.innerHTML = `
      <div class="sales-table-wrap" style="background: #fff; border: 1.5px solid var(--slate-200); border-radius: 16px; padding: 8px 16px 16px; box-shadow: var(--shadow-sm);">
        <table class="sales-table" style="border-spacing: 0;">
          <thead>
            <tr style="border-bottom: 2px solid var(--slate-100);">
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Voucher No.</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Date</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Customer</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Sales Executive</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Supply Type</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Type</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Payment Status</th>
              <th style="padding: 12px 16px; text-align: right; border-bottom: 2px solid var(--slate-100);">Total Amount</th>
              <th style="padding: 12px 16px; text-align: center; border-bottom: 2px solid var(--slate-100);">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  function deleteSalesInvoice(id) {
    const list = window.KYA_STORE.salesVouchers || [];
    const index = list.findIndex(v => v.id === id);
    if (index === -1) return;
    const invoice = list[index];
    const isRet = !!invoice.isReturn;
    const isOrd = !!invoice.isOrder;
    
    let titleText = 'Delete Posted Invoice?';
    let messageText = 'Are you sure you want to delete this sales invoice? This will also delete the corresponding journal entry and cannot be undone.';
    if (isRet) {
      titleText = 'Delete Posted Return?';
      messageText = 'Are you sure you want to delete this sales return? This will also delete the corresponding journal entry and cannot be undone.';
    } else if (isOrd) {
      titleText = 'Delete Sales Order?';
      messageText = 'Are you sure you want to delete this sales order? This will also delete the corresponding journal entry (if any) and cannot be undone.';
    }
    
    showKyaConfirm({
      title: titleText,
      message: messageText,
      confirmLabel: 'Delete',
      okBg: 'var(--red-600)',
      onConfirm: () => {
        list.splice(index, 1);
        window.KYA_STORE.salesVouchers = list;
        
        if (invoice.journalEntryId) {
          postedEntries = postedEntries.filter(e => e.id !== invoice.journalEntryId);
        }
        if (invoice.refundJournalEntryIds) {
          postedEntries = postedEntries.filter(e => !invoice.refundJournalEntryIds.includes(e.id));
        }
        
        let successMsg = `Invoice "${invoice.invoiceNo}" deleted.`;
        if (isRet) successMsg = `Sales Return "${invoice.invoiceNo}" deleted.`;
        else if (isOrd) successMsg = `Sales Order "${invoice.invoiceNo}" deleted.`;
        
        showToast(successMsg, 'success');
        renderSalesPostedPanel();
        refreshAllReports();
        triggerAutoBackup();
      }
    });
  }

  function openRefundModal(invoiceId) {
    const list = window.KYA_STORE.salesVouchers || [];
    const inv = list.find(v => v.id === invoiceId);
    if (!inv) return;
    
    // Calculate values
    let orderAdvanceAmount = 0;
    if (inv.orderNo) {
      const linkedOrder = list.find(v => v.isOrder && v.invoiceNo.toLowerCase() === inv.orderNo.toLowerCase());
      if (linkedOrder) {
        if (linkedOrder.paymentStatus === 'Full Payment') {
          orderAdvanceAmount = linkedOrder.total;
        } else if (linkedOrder.paymentStatus === 'Partial Payment') {
          orderAdvanceAmount = linkedOrder.paymentAmount || 0;
        }
      }
    }
    const excessAmount = Math.max(0, orderAdvanceAmount - inv.total);
    const refundedAmount = inv.refundedAmount || 0;
    const remainingRefund = Math.max(0, excessAmount - refundedAmount);
    
    if (remainingRefund <= 0) {
      showToast('This invoice is already fully refunded.', 'warning');
      return;
    }
    
    // Create Modal HTML
    const overlay = document.createElement('div');
    overlay.className = 'coa-modal-overlay';
    overlay.id = 'refundModalOverlay';
    
    const accounts = coaLedgers.filter(l => l.type === 'ledger' && l.sgId === 'sg-cce');
    const accOptions = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    
    overlay.innerHTML = `
      <div class="coa-modal-card" style="max-width: 420px; padding: 24px;">
        <div class="coa-modal-hdr" style="margin-bottom: 20px;">
          <div class="coa-modal-title" style="font-size: 16px; font-weight: 700; color: var(--slate-900);">Record Refund - ${inv.invoiceNo}</div>
          <button class="coa-modal-close" onclick="document.getElementById('refundModalOverlay').remove()">✕</button>
        </div>
        
        <div style="background: var(--slate-50); border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: var(--slate-700); line-height: 1.6;">
          <div style="display: flex; justify-content: space-between;">
            <span>Total Refund Due:</span>
            <span style="font-weight: 700;">₹ ${fmtNum(excessAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Already Refunded:</span>
            <span style="font-weight: 700; color: var(--slate-600);">₹ ${fmtNum(refundedAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px; border-top: 1px dashed var(--slate-200); padding-top: 4px; font-weight: 700; color: #ef4444;">
            <span>Remaining Refund:</span>
            <span>₹ ${fmtNum(remainingRefund)}</span>
          </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-weight: 700; font-size: 10px; text-transform: uppercase; color: var(--slate-400);">Refund Date *</label>
            <input type="date" id="refundModalDate" class="je-input" style="height: 38px; padding: 0 10px; font-size: 13px; font-weight: 600;" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-weight: 700; font-size: 10px; text-transform: uppercase; color: var(--slate-400);">Refund From (Payment Account) *</label>
            <select id="refundModalAccount" class="je-input" style="height: 38px; padding: 0 10px; font-size: 13px; font-weight: 600; cursor: pointer;">
              <option value="">&mdash; Select Account &mdash;</option>
              ${accOptions}
            </select>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-weight: 700; font-size: 10px; text-transform: uppercase; color: var(--slate-400);">Refund Amount *</label>
            <input type="number" id="refundModalAmount" class="je-input" placeholder="0.00" min="0.01" max="${remainingRefund}" step="0.01" style="height: 38px; padding: 0 10px;" value="${remainingRefund.toFixed(2)}" />
          </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;">
          <button class="btn btn-secondary" onclick="document.getElementById('refundModalOverlay').remove()" style="padding: 8px 16px; font-size: 13px; font-weight: 600;">Cancel</button>
          <button class="btn btn-primary" id="btnConfirmRefundSubmit" style="padding: 8px 16px; font-size: 13px; font-weight: 600; background: var(--emerald-600); border-color: var(--emerald-600);">Process Refund</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('btnConfirmRefundSubmit').addEventListener('click', () => {
      const refDate = document.getElementById('refundModalDate').value;
      const refAccId = document.getElementById('refundModalAccount').value;
      const refAmt = parseFloat(document.getElementById('refundModalAmount').value) || 0;
      
      if (!refAccId) {
        showToast('Please select a payment account for the refund.', 'warning');
        return;
      }
      if (refAmt <= 0) {
        showToast('Refund Amount must be greater than zero.', 'warning');
        return;
      }
      if (refAmt > remainingRefund) {
        showToast(`Refund Amount cannot exceed the remaining refund of ₹${fmtNum(remainingRefund)}.`, 'warning');
        return;
      }
      
      // Post the Refund Journal Entry
      const payAccount = coaLedgers.find(l => l.id == refAccId);
      const payAccountName = payAccount ? payAccount.name : 'Cash Account';
      
      const refundLedgerId = getOrCreateSystemLedger('Refund Payable', 'sg-ocl');
      const refundLedgerName = coaLedgers.find(l => l.id == refundLedgerId).name;
      
      const journalRows = [
        {
          id: 1,
          type: 'By',
          particular: refundLedgerName,
          debit: refAmt.toFixed(2),
          credit: ''
        },
        {
          id: 2,
          type: 'To',
          particular: payAccountName,
          debit: '',
          credit: refAmt.toFixed(2)
        }
      ];
      
      const entryId = Date.now();
      const customer = coaLedgers.find(l => l.id == inv.customerId);
      const customerName = customer ? customer.name : 'Unknown Customer';
      
      const entry = {
        id:             entryId,
        date:           refDate,
        voucherNo:      `RF-${inv.invoiceNo}`,
        preparedBy:     'Sales Module',
        departmentId:   '',
        isBudget:       false,
        firstParticular: refundLedgerName,
        amount:         fmtNum(refAmt),
        allRows:        journalRows,
        narration:      `Refund of overpaid advance of ₹${fmtNum(refAmt)} processed against Sales Invoice ${inv.invoiceNo} for customer ${customerName}. paid via ${payAccountName}.`
      };
      
      postedEntries.unshift(entry);
      
      // Update Sales Invoice object
      inv.refundedAmount = (inv.refundedAmount || 0) + refAmt;
      inv.refundJournalEntryIds = inv.refundJournalEntryIds || [];
      inv.refundJournalEntryIds.push(entryId);
      
      if (inv.refundedAmount >= excessAmount) {
        inv.paymentStatus = 'Full Refund';
      } else {
        inv.paymentStatus = 'Partial Refund';
      }
      
      // Save changes
      const idx = window.KYA_STORE.salesVouchers.findIndex(v => v.id === inv.id);
      if (idx > -1) {
        window.KYA_STORE.salesVouchers[idx] = inv;
      }
      
      overlay.remove();
      showToast(`Refund of ₹${fmtNum(refAmt)} processed successfully.`, 'success');
      
      renderSalesPostedPanel();
      refreshAllReports();
      triggerAutoBackup();
    });
  }

  function renderSalesDraftedPanel() {
    const wrap = document.getElementById('salesDraftedTableWrap');
    if (!wrap) return;
    
    const list = window.KYA_STORE.salesVouchersDrafts || [];
    if (list.length === 0) {
      wrap.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--slate-400);">
          <div style="font-size: 40px; margin-bottom: 12px;">📝</div>
          <div style="font-weight: 600; font-size: 15px; color: var(--slate-500);">No Drafts Found</div>
          <p style="font-size: 13px; margin: 4px 0 16px;">Save an invoice as a draft to see it here.</p>
        </div>
      `;
      return;
    }
    
    const sorted = [...list].sort((a,b) => b.updatedAt - a.updatedAt);
    
    let rowsHtml = sorted.map(draft => {
      const custName = draft.customerId ? ((coaLedgers.find(l => l.id == draft.customerId) || { name: 'Unknown Customer' }).name) : '&mdash; No Customer &mdash;';
      let execName = '&mdash;';
      if (draft.salesExecutiveId) {
        const execEmp = ohEmployees.find(e => e.id == draft.salesExecutiveId);
        if (execEmp) execName = execEmp.name;
      }
      const isRet = !!draft.isReturn;
      const isOrd = !!draft.isOrder;
      
      let badgeHtml = '';
      if (isRet) {
        badgeHtml = `<span class="badge" style="background: var(--red-50); color: var(--red-700); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px;">Return</span>`;
      } else if (isOrd) {
        badgeHtml = `<span class="badge" style="background: var(--emerald-50); color: var(--emerald-700); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px;">Order</span>`;
      } else {
        badgeHtml = `<span class="badge" style="background: var(--blue-50); color: var(--blue-700); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px;">Invoice</span>`;
      }
      
      let totalColor = 'var(--slate-700)';
      if (isRet) totalColor = '#dc2626';
      else if (isOrd) totalColor = 'var(--emerald-700)';

      return `
        <tr class="sales-row">
          <td style="padding: 14px 16px; font-weight: 700; color: var(--slate-700);">${ohEsc(draft.invoiceNo || 'Draft')}</td>
          <td style="padding: 14px 16px;">${draft.date || '&mdash;'}</td>
          <td style="padding: 14px 16px; font-weight: 600;">${ohEsc(custName)}</td>
          <td style="padding: 14px 16px; color: var(--slate-600);">${ohEsc(execName)}</td>
          <td style="padding: 14px 16px; color: var(--slate-500); font-size: 12.5px;">${ohEsc(supplyType)}</td>
          <td style="padding: 14px 16px;">
            ${badgeHtml}
            <span class="badge" style="background: var(--slate-100); color: var(--slate-600); font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 11px;">${draft.type}</span>
          </td>
          <td style="padding: 14px 16px; text-align: right; font-weight: 700; color: ${totalColor};">₹ ${fmtNum(draft.total)}</td>
          <td style="padding: 14px 16px; text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm" onclick="editSalesDraft(${draft.id})" style="padding: 6px 12px; font-size: 12px;">Edit / Load</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSalesDraft(${draft.id})" style="padding: 6px 12px; font-size: 12px; background: var(--red-50); color: var(--red-600); border: 1.5px solid var(--red-100);">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
    
    wrap.innerHTML = `
      <div class="sales-table-wrap" style="background: #fff; border: 1.5px solid var(--slate-200); border-radius: 16px; padding: 8px 16px 16px; box-shadow: var(--shadow-sm);">
        <table class="sales-table" style="border-spacing: 0;">
          <thead>
            <tr style="border-bottom: 2px solid var(--slate-100);">
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Voucher No.</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Date</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Customer</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Sales Executive</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Supply Type</th>
              <th style="padding: 12px 16px; border-bottom: 2px solid var(--slate-100);">Type</th>
              <th style="padding: 12px 16px; text-align: right; border-bottom: 2px solid var(--slate-100);">Total Amount</th>
              <th style="padding: 12px 16px; text-align: center; border-bottom: 2px solid var(--slate-100);">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  function editSalesDraft(id) {
    const list = window.KYA_STORE.salesVouchersDrafts || [];
    const draft = list.find(d => d.id === id);
    if (!draft) return;
    
    loadSalesInvoice(draft, true);
  }

  function deleteSalesDraft(id) {
    showKyaConfirm({
      title: 'Delete Draft?',
      message: 'Are you sure you want to delete this draft? This action cannot be undone.',
      confirmLabel: 'Delete',
      okBg: 'var(--red-600)',
      onConfirm: () => {
        let list = window.KYA_STORE.salesVouchersDrafts || [];
        list = list.filter(d => d.id !== id);
        window.KYA_STORE.salesVouchersDrafts = list;
        showToast('Draft deleted successfully.', 'success');
        renderSalesDraftedPanel();
        triggerAutoBackup();
      }
    });
  }

  function viewPrintInvoice(id) {
    const list = window.KYA_STORE.salesVouchers || [];
    const inv = list.find(v => v.id === id);
    if (!inv) return;
    
    const customer = coaLedgers.find(l => l.id == inv.customerId) || { name: 'Unknown Customer' };
    
    let execName = '';
    if (inv.salesExecutiveId) {
      const execEmp = ohEmployees.find(e => e.id == inv.salesExecutiveId);
      if (execEmp) {
        execName = execEmp.name;
      }
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'inv-modal-overlay';
    overlay.id = 'salesInvoicePrintOverlay';
    
    let rowsHtml = '';
    if (inv.type === 'Product') {
      rowsHtml = inv.rows.map((r, i) => {
        const base = r.qty * r.rate;
        const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
        const itemTotal = base - discAmt;
        const taxAmt = itemTotal * (r.tax / 100);
        const finalAmt = itemTotal + taxAmt;
        const discStr = r.discountType === 'pct' ? `${r.discount}% (₹${fmtNum(discAmt)})` : `₹${fmtNum(r.discount)}`;
        return `
          <tr style="border-bottom: 1px solid var(--slate-100);">
            <td style="padding: 10px; font-weight: 500;">${i+1}</td>
            <td style="padding: 10px; font-weight: 600;">${ohEsc(r.item)}</td>
            <td style="padding: 10px; text-align: right;">${r.qty}</td>
            <td style="padding: 10px; text-align: right;">₹ ${fmtNum(r.rate)}</td>
            <td style="padding: 10px; text-align: right;">${discStr}</td>
            <td style="padding: 10px; text-align: right;">${r.tax}%</td>
            <td style="padding: 10px; text-align: right; font-weight: 700;">₹ ${fmtNum(finalAmt)}</td>
          </tr>
        `;
      }).join('');
    } else {
      rowsHtml = inv.rows.map((r, i) => {
        const revenueName = (coaLedgers.find(l => l.id == r.revenueLedgerId) || { name: 'Revenue Account' }).name;
        const base = r.baseAmount;
        const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
        const itemTotal = base - discAmt;
        const taxAmt = itemTotal * (r.tax / 100);
        const finalAmt = itemTotal + taxAmt;
        const discStr = r.discountType === 'pct' ? `${r.discount}% (₹${fmtNum(discAmt)})` : `₹${fmtNum(r.discount)}`;
        return `
          <tr style="border-bottom: 1px solid var(--slate-100);">
            <td style="padding: 10px; font-weight: 500;">${i+1}</td>
            <td style="padding: 10px; font-weight: 600;">${ohEsc(revenueName)}</td>
            <td style="padding: 10px; text-align: right;">1</td>
            <td style="padding: 10px; text-align: right;">₹ ${fmtNum(r.baseAmount)}</td>
            <td style="padding: 10px; text-align: right;">${discStr}</td>
            <td style="padding: 10px; text-align: right;">${r.tax}%</td>
            <td style="padding: 10px; text-align: right; font-weight: 700;">₹ ${fmtNum(finalAmt)}</td>
          </tr>
        `;
      }).join('');
    }
    
    let taxDetailsHtml = '';
    const taxSummary = {};
    inv.rows.forEach(r => {
      const base = inv.type === 'Product' ? (r.qty * r.rate) : r.baseAmount;
      const discAmt = r.discountType === 'pct' ? (base * (r.discount / 100)) : r.discount;
      const val = Math.max(0, base - discAmt);
      const taxAmt = val * (r.tax / 100);
      if (r.tax > 0) {
        if (!taxSummary[r.tax]) {
          taxSummary[r.tax] = { taxable: 0, taxAmt: 0 };
        }
        taxSummary[r.tax].taxable += val;
        taxSummary[r.tax].taxAmt += taxAmt;
      }
    });
    
    const supplyType = inv.salesSupplyType || 'Intra-State (CGST + SGST)';
    for (const pct in taxSummary) {
      const taxable = taxSummary[pct].taxable;
      const taxAmt = taxSummary[pct].taxAmt;
      if (supplyType === 'Intra-State (CGST + SGST)' || supplyType === 'Deemed Export') {
        const halfPct = parseFloat(pct) / 2;
        const halfAmt = taxAmt / 2;
        taxDetailsHtml += `
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--slate-500); margin-top: 4px;">
            <span>CGST @ ${halfPct}% (on ₹ ${fmtNum(taxable)})</span>
            <span>₹ ${fmtNum(halfAmt)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--slate-500); margin-top: 4px;">
            <span>SGST @ ${halfPct}% (on ₹ ${fmtNum(taxable)})</span>
            <span>₹ ${fmtNum(halfAmt)}</span>
          </div>
        `;
      } else if (supplyType === 'Inter-State (IGST)' || supplyType === 'SEZ With Tax') {
        taxDetailsHtml += `
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--slate-500); margin-top: 4px;">
            <span>IGST @ ${pct}% (on ₹ ${fmtNum(taxable)})</span>
            <span>₹ ${fmtNum(taxAmt)}</span>
          </div>
        `;
      } else {
        taxDetailsHtml += `
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--slate-500); margin-top: 4px;">
            <span>GST @ ${pct}% (on ₹ ${fmtNum(taxable)})</span>
            <span>₹ ${fmtNum(taxAmt)}</span>
          </div>
        `;
      }
    }
    
    overlay.innerHTML = `
      <div class="inv-modal-card" style="padding: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1.5px solid var(--slate-100); background: var(--slate-50); border-radius: 20px 20px 0 0;">
          <div style="font-weight: 700; color: var(--slate-800);">${inv.isReturn ? 'Sales Return Preview' : (inv.isOrder ? 'Sales Order Preview' : 'Invoice Preview')}</div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button onclick="loadSalesInvoice((window.KYA_STORE.salesVouchers || []).find(v => v.id === ${inv.id}), false); document.getElementById('salesInvoicePrintOverlay')?.remove();" title="Edit Invoice" style="background: var(--blue-50); border: 1.5px solid var(--blue-100); border-radius: 6px; padding: 8px; cursor: pointer; color: var(--blue-600); display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='var(--blue-100)'" onmouseout="this.style.background='var(--blue-50)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button onclick="deleteSalesInvoice(${inv.id}); document.getElementById('salesInvoicePrintOverlay')?.remove();" title="Delete Invoice" style="background: var(--red-50); border: 1.5px solid var(--red-100); border-radius: 6px; padding: 8px; cursor: pointer; color: var(--red-600); display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='var(--red-100)'" onmouseout="this.style.background='var(--red-50)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button class="btn btn-secondary" id="btnPrintInvoiceAction" style="padding: 8px 16px;">
              <svg viewBox="0 0 16 16" fill="none" style="width: 14px; height: 14px; margin-right: 6px; display: inline-block; vertical-align: middle;">
                <path d="M4 5v-3h8v3M2 5h12v7h-3v3H5v-3H2V5zm3 4h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              Print
            </button>
            <button class="btn btn-danger" id="btnCloseInvoiceAction" style="padding: 8px 16px;">Close</button>
          </div>
        </div>
        
        <div id="invoicePrintArea" style="padding: 40px; background: #fff; color: #1e293b;">
          <style>
            @media print {
              body * { visibility: hidden; }
              #invoicePrintArea, #invoicePrintArea * { visibility: visible; }
              #invoicePrintArea { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
            }
          </style>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div>
              <div style="font-size: 26px; font-weight: 900; color: var(--blue-800); letter-spacing: -1px; display: flex; align-items: center; gap: 8px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent);">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                </svg>
                Keep Your Account (KYA)
              </div>
              <div style="font-size: 13px; color: var(--slate-500); margin-top: 6px; font-weight: 500;">
                Your Trusted Cloud Accounting Suite
              </div>
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; font-weight: 900; text-transform: uppercase; color: var(--slate-800); margin: 0; letter-spacing: -0.5px;">${inv.isReturn ? 'Credit Note / Sales Return' : (inv.isOrder ? 'Sales Order' : 'Tax Invoice')}</h1>
              <div style="font-size: 14px; font-weight: 700; color: var(--blue-700); margin-top: 4px;"># ${ohEsc(inv.invoiceNo)}</div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-bottom: 2px solid var(--slate-100); padding-bottom: 30px; margin-bottom: 30px;">
            <div>
              <h3 style="font-size: 11px; text-transform: uppercase; color: var(--slate-400); letter-spacing: 0.1em; margin-bottom: 12px; font-weight: 700;">Billed To:</h3>
              <div style="font-size: 16px; font-weight: 800; color: var(--slate-900);">${ohEsc(customer.name)}</div>
              <div style="font-size: 13px; color: var(--slate-500); margin-top: 4px; font-weight: 500;">Trade Receivables Account</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13.5px;">
              <div>
                <div style="color: var(--slate-400); font-weight: 600; font-size: 11px; text-transform: uppercase;">${inv.isReturn ? 'Return Date:' : (inv.isOrder ? 'Order Date:' : 'Invoice Date:')}</div>
                <div style="font-weight: 700; color: var(--slate-800); margin-top: 2px;">${inv.date}</div>
              </div>
              <div>
                <div style="color: var(--slate-400); font-weight: 600; font-size: 11px; text-transform: uppercase;">Due Date:</div>
                <div style="font-weight: 700; color: var(--slate-800); margin-top: 2px;">${inv.dueDate || inv.date}</div>
              </div>
              ${!inv.isOrder ? `
              <div>
                <div style="color: var(--slate-400); font-weight: 600; font-size: 11px; text-transform: uppercase;">Order Number:</div>
                <div style="font-weight: 700; color: var(--slate-800); margin-top: 2px;">${ohEsc(inv.orderNo) || '&mdash;'}</div>
              </div>
              ` : ''}
              <div>
                <div style="color: var(--slate-400); font-weight: 600; font-size: 11px; text-transform: uppercase;">Payment Terms:</div>
                <div style="font-weight: 700; color: var(--slate-800); margin-top: 2px;">Due on Receipt</div>
              </div>
              <div>
                <div style="color: var(--slate-400); font-weight: 600; font-size: 11px; text-transform: uppercase;">Supply Type:</div>
                <div style="font-weight: 700; color: var(--slate-800); margin-top: 2px;">${ohEsc(inv.salesSupplyType || 'Intra-State (CGST + SGST)')}</div>
              </div>
              ${execName ? `
              <div>
                <div style="color: var(--slate-400); font-weight: 600; font-size: 11px; text-transform: uppercase;">Sales Executive:</div>
                <div style="font-weight: 700; color: var(--slate-800); margin-top: 2px;">${ohEsc(execName)}</div>
              </div>
              ` : ''}
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13.5px;">
            <thead>
              <tr style="border-bottom: 2px solid var(--slate-200); background: var(--slate-50);">
                <th style="padding: 10px; text-align: left; font-weight: 700; color: var(--slate-500); width: 40px;">#</th>
                <th style="padding: 10px; text-align: left; font-weight: 700; color: var(--slate-500);">Description</th>
                <th style="padding: 10px; text-align: right; font-weight: 700; color: var(--slate-500); width: 60px;">Qty</th>
                <th style="padding: 10px; text-align: right; font-weight: 700; color: var(--slate-500); width: 110px;">Rate</th>
                <th style="padding: 10px; text-align: right; font-weight: 700; color: var(--slate-500); width: 90px;">Discount</th>
                <th style="padding: 10px; text-align: right; font-weight: 700; color: var(--slate-500); width: 80px;">Tax</th>
                <th style="padding: 10px; text-align: right; font-weight: 700; color: var(--slate-500); width: 140px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; margin-top: 30px;">
            <div>
              <h4 style="font-size: 11px; text-transform: uppercase; color: var(--slate-400); letter-spacing: 0.05em; margin-bottom: 8px; font-weight: 700;">Terms & Notes:</h4>
              <div style="font-size: 12.5px; color: var(--slate-600); line-height: 1.5; white-space: pre-wrap; font-weight: 500;">${ohEsc(inv.notes) || (inv.isReturn ? 'Sales Return / Credit Note processed.' : (inv.isOrder ? 'Sales Order placed.' : 'Thank you for your business! Please settle this invoice by the due date.'))}</div>
            </div>
            
            <div>
              <div style="background: var(--slate-50); border-radius: 16px; padding: 18px 22px;">
                <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: var(--slate-600); margin-bottom: 8px; font-weight: 500;">
                  <span>Sub Total</span>
                  <span>₹ ${fmtNum(inv.subTotal)}</span>
                </div>
                
                ${taxDetailsHtml}
                
                ${inv.tdsTcsMode !== 'None' ? `
                  <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: var(--slate-600); margin-top: 8px; border-top: 1px dashed var(--slate-200); padding-top: 8px; font-weight: 500;">
                    <span>${inv.tdsTcsMode} (${(inv.tdsTcsRate % 1 === 0 ? inv.tdsTcsRate.toFixed(0) : (inv.tdsTcsRate * 10 % 1 === 0 ? inv.tdsTcsRate.toFixed(1) : inv.tdsTcsRate.toFixed(2)))}%)</span>
                    <span>${inv.tdsTcsMode === 'TDS' ? '-' : '+'} ₹ ${fmtNum(inv.tdsTcsAmount)}</span>
                  </div>
                ` : ''}
                
                ${inv.adjustments !== 0 ? `
                  <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: var(--slate-600); margin-top: 8px; border-top: 1px dashed var(--slate-200); padding-top: 8px; font-weight: 500;">
                    <span>Adjustments</span>
                    <span>₹ ${fmtNum(inv.adjustments)}</span>
                  </div>
                ` : ''}
                
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: var(--slate-900); margin-top: 12px; border-top: 2px solid var(--slate-200); padding-top: 12px;">
                  <span>Grand Total</span>
                  <span>₹ ${fmtNum(inv.total)}</span>
                </div>
                
                ${inv.excessAmount > 0 ? `
                  <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: var(--slate-600); margin-top: 8px; border-top: 1px dashed var(--slate-200); padding-top: 8px; font-weight: 500;">
                    <span>Order Advance Applied</span>
                    <span style="color: var(--emerald-700); font-weight: 700;">₹ ${fmtNum(inv.total + inv.excessAmount)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--slate-600); margin-top: 6px; font-weight: 500;">
                    <span>Refund Status</span>
                    <span style="font-weight: 700; color: var(--slate-700);">${inv.paymentStatus}</span>
                  </div>
                  ${inv.refundedAmount > 0 ? `
                    <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--slate-600); margin-top: 6px; font-weight: 500;">
                      <span>Amount Refunded</span>
                      <span style="color: #10b981; font-weight: 700;">₹ ${fmtNum(inv.refundedAmount)}</span>
                    </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: var(--slate-900); margin-top: 6px; font-weight: 700;">
                    <span>Refund Payable</span>
                    <span style="color: ${inv.excessAmount - (inv.refundedAmount || 0) > 0 ? '#ef4444' : 'var(--slate-600)'};">₹ ${fmtNum(inv.excessAmount - (inv.refundedAmount || 0))}</span>
                  </div>
                ` : `
                  ${inv.paymentStatus && inv.paymentStatus !== 'Not Paid' ? `
                    <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--slate-600); margin-top: 8px; border-top: 1px dashed var(--slate-200); padding-top: 8px; font-weight: 500;">
                      <span>Paid Amount (${inv.paymentStatus})</span>
                      <span style="color: #10b981; font-weight: 700;">₹ ${fmtNum(inv.paymentAmount)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: var(--slate-900); margin-top: 6px; font-weight: 700;">
                      <span>Balance Due</span>
                      <span style="color: ${inv.total - inv.paymentAmount > 0 ? '#ef4444' : 'var(--slate-600)'};">₹ ${fmtNum(inv.total - inv.paymentAmount)}</span>
                    </div>
                  ` : `
                    <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: var(--slate-900); margin-top: 8px; border-top: 1px dashed var(--slate-200); padding-top: 8px; font-weight: 700;">
                      <span>Balance Due</span>
                      <span style="color: #ef4444;">₹ ${fmtNum(inv.total)}</span>
                    </div>
                  `}
                `}
              </div>
            </div>
          </div>
          
          <div style="margin-top: 60px; border-top: 1px solid var(--slate-100); padding-top: 20px; text-align: center; font-size: 11.5px; color: var(--slate-400); font-weight: 500;">
            This is a system generated document. No signature required.
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    overlay.focus();
    
    overlay.querySelector('#btnCloseInvoiceAction').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btnPrintInvoiceAction').addEventListener('click', () => {
      window.print();
    });
    
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.remove(); });
  }

  window.viewPrintInvoice = viewPrintInvoice;
  window.deleteSalesInvoice = deleteSalesInvoice;
  window.editSalesDraft = editSalesDraft;
  window.deleteSalesDraft = deleteSalesDraft;
  window.loadSalesInvoice = loadSalesInvoice;

  function updateDueDateHelper() {
    const dateEl = document.getElementById('salesDate');
    const dueEl = document.getElementById('salesDueDate');
    const daysEl = document.getElementById('salesDueDateDays');
    if (!dateEl || !dueEl || !daysEl) return;
    
    const dateVal = dateEl.value;
    const dueVal = dueEl.value;
    
    if (!dateVal || !dueVal) {
      daysEl.textContent = '';
      return;
    }
    
    const d1 = new Date(dateVal);
    const d2 = new Date(dueVal);
    
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      daysEl.textContent = `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      daysEl.style.color = 'var(--blue-600)';
    } else if (diffDays === 0) {
      daysEl.textContent = 'Due today';
      daysEl.style.color = 'var(--slate-500)';
    } else {
      daysEl.textContent = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
      daysEl.style.color = 'var(--red-600)';
    }
  }

  function setupSalesVoucherEventListeners() {
    // Searchable dropdown for sales returns
    const selectTrigger = document.getElementById('salesInvoiceSelectTrigger');
    const selectDropdown = document.getElementById('salesInvoiceSelectDropdown');
    const selectSearch = document.getElementById('salesInvoiceSelectSearch');
    
    if (selectTrigger && selectDropdown && selectSearch) {
      selectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = selectDropdown.style.display === 'flex';
        if (isOpen) {
          selectDropdown.style.display = 'none';
        } else {
          // Close other select dropdowns if open
          const orderDropdown = document.getElementById('salesOrderSelectDropdown');
          if (orderDropdown) orderDropdown.style.display = 'none';

          selectDropdown.style.display = 'flex';
          selectSearch.value = '';
          refreshSalesInvoiceDropdownOptions();
          setTimeout(() => selectSearch.focus(), 50);
        }
      });
      
      selectSearch.addEventListener('input', () => {
        refreshSalesInvoiceDropdownOptions(selectSearch.value);
      });
      
      selectSearch.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      document.addEventListener('click', (e) => {
        if (!selectTrigger.contains(e.target) && !selectDropdown.contains(e.target)) {
          selectDropdown.style.display = 'none';
        }
      });
    }

    // Searchable dropdown for sales orders
    const orderSelectTrigger = document.getElementById('salesOrderSelectTrigger');
    const orderSelectDropdown = document.getElementById('salesOrderSelectDropdown');
    const orderSelectSearch = document.getElementById('salesOrderSelectSearch');
    
    if (orderSelectTrigger && orderSelectDropdown && orderSelectSearch) {
      orderSelectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = orderSelectDropdown.style.display === 'flex';
        if (isOpen) {
          orderSelectDropdown.style.display = 'none';
        } else {
          // Close other select dropdowns if open
          const invoiceDropdown = document.getElementById('salesInvoiceSelectDropdown');
          if (invoiceDropdown) invoiceDropdown.style.display = 'none';

          orderSelectDropdown.style.display = 'flex';
          orderSelectSearch.value = '';
          refreshSalesOrderDropdownOptions();
          setTimeout(() => orderSelectSearch.focus(), 50);
        }
      });
      
      orderSelectSearch.addEventListener('input', () => {
        refreshSalesOrderDropdownOptions(orderSelectSearch.value);
      });
      
      orderSelectSearch.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      document.addEventListener('click', (e) => {
        if (!orderSelectTrigger.contains(e.target) && !orderSelectDropdown.contains(e.target)) {
          orderSelectDropdown.style.display = 'none';
        }
      });
    }

    const invNoEl = document.getElementById('salesInvoiceNo');
    const chipEl = document.getElementById('salesVoucherChipDisplay');
    if (invNoEl && chipEl) {
      invNoEl.addEventListener('input', () => {
        let fallback = 'INV-XXXX';
        if (currentSalesVoucherSubtype === 'Return') fallback = 'RET-XXXX';
        else if (currentSalesVoucherSubtype === 'Order') fallback = 'SO-XXXX';
        chipEl.textContent = invNoEl.value.trim() || fallback;
      });
    }
    
    document.getElementById('salesTypeProduct').addEventListener('click', () => {
      const bg = document.getElementById('salesTypeBg');
      if (bg) {
        bg.classList.add('prod-active');
        bg.classList.remove('serv-active');
      }
      document.getElementById('salesTypeProduct').classList.add('active');
      document.getElementById('salesTypeService').classList.remove('active');
      switchSalesType('Product');
    });
    
    document.getElementById('salesTypeService').addEventListener('click', () => {
      const bg = document.getElementById('salesTypeBg');
      if (bg) {
        bg.classList.add('serv-active');
        bg.classList.remove('prod-active');
      }
      document.getElementById('salesTypeService').classList.add('active');
      document.getElementById('salesTypeProduct').classList.remove('active');
      switchSalesType('Service');
    });
    
    const noneBtn = document.getElementById('salesTdsTcsNone');
    const tdsBtn = document.getElementById('salesTdsTcsTds');
    const tcsBtn = document.getElementById('salesTdsTcsTcs');
    const tBg = document.getElementById('salesTdsTcsBg');
    const rateGroup = document.getElementById('salesTdsTcsRateGroup');
    const amtRow = document.getElementById('salesTdsTcsAmountRow');
    const amtLabel = document.getElementById('salesTdsTcsAmountLabel');
    
    if (noneBtn && tdsBtn && tcsBtn && tBg && rateGroup && amtRow && amtLabel) {
      noneBtn.addEventListener('click', () => {
        noneBtn.classList.add('active');
        tdsBtn.classList.remove('active');
        tcsBtn.classList.remove('active');
        tBg.className = 'sales-tdstcs-bg none-active';
        rateGroup.style.display = 'none';
        amtRow.style.display = 'none';
        recalculateSalesTotals();
      });
      
      tdsBtn.addEventListener('click', () => {
        tdsBtn.classList.add('active');
        noneBtn.classList.remove('active');
        tcsBtn.classList.remove('active');
        tBg.className = 'sales-tdstcs-bg tds-active';
        rateGroup.style.display = 'block';
        amtRow.style.display = 'flex';
        amtLabel.textContent = 'TDS Deducted (Dr)';
        recalculateSalesTotals();
      });
      
      tcsBtn.addEventListener('click', () => {
        tcsBtn.classList.add('active');
        noneBtn.classList.remove('active');
        tdsBtn.classList.remove('active');
        tBg.className = 'sales-tdstcs-bg tcs-active';
        rateGroup.style.display = 'block';
        amtRow.style.display = 'flex';
        amtLabel.textContent = 'TCS Collected (Cr)';
        recalculateSalesTotals();
      });
    }
    
    const addRowBtn = document.getElementById('salesAddRow');
    if (addRowBtn) {
      addRowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addSalesRow();
      });
    }
    
    const clearBtn = document.getElementById('btnClearSales');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window._editingSalesInvoice = null;
        initSalesForm();
      });
    }
    
    const newSalesBtn = document.getElementById('btnNewSales');
    if (newSalesBtn) {
      newSalesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentSalesVoucherSubtype = 'Invoice';
        window._editingSalesInvoice = null;
        initSalesForm();
      });
    }
    
    const saveDraftBtn = document.getElementById('btnSaveSalesDraft');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveSalesDraft();
      });
    }
    
    const postInvoiceBtn = document.getElementById('btnPostSales');
    if (postInvoiceBtn) {
      postInvoiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        postSalesInvoice();
      });
    }
    
    const rateSelect = document.getElementById('salesTdsTcsRateSelect');
    if (rateSelect) {
      rateSelect.addEventListener('change', () => {
        const customWrap = document.getElementById('salesTdsTcsRateCustomWrap');
        if (rateSelect.value === 'custom') {
          if (customWrap) customWrap.style.display = 'block';
        } else {
          if (customWrap) customWrap.style.display = 'none';
        }
        recalculateSalesTotals();
      });
    }
    const customInput = document.getElementById('salesTdsTcsRateCustom');
    if (customInput) {
      customInput.addEventListener('input', recalculateSalesTotals);
    }
    
    const tdsTcsAmt = document.getElementById('salesTdsTcsAmount');
    if (tdsTcsAmt) tdsTcsAmt.addEventListener('input', recalculateSalesTotals);
    
    const adjustments = document.getElementById('salesAdjustments');
    if (adjustments) adjustments.addEventListener('input', recalculateSalesTotals);
    
    const body = document.getElementById('salesItemBody');
    if (body) {
      body.addEventListener('input', (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const index = parseInt(tr.dataset.rowIndex);
        updateRowFromDOM(index, tr);
      });
      
      body.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const index = parseInt(tr.dataset.rowIndex);
        updateRowFromDOM(index, tr);
      });
      
      body.addEventListener('click', (e) => {
        const btn = e.target.closest('.sales-del-row');
        if (btn) {
          const tr = btn.closest('tr');
          const index = parseInt(tr.dataset.rowIndex);
          salesRows.splice(index, 1);
          if (salesRows.length === 0) {
            addSalesRow();
          } else {
            renderSalesRows();
            recalculateSalesTotals();
          }
        }
      });
    }
    
    const dateEl = document.getElementById('salesDate');
    const dueEl = document.getElementById('salesDueDate');
    if (dateEl && dueEl) {
      dateEl.addEventListener('change', () => {
        dueEl.value = dateEl.value;
        updateDueDateHelper();
      });
      dueEl.addEventListener('change', () => {
        updateDueDateHelper();
      });
    }
    
    const custEl = document.getElementById('salesCustomer');
    if (custEl) {
      custEl.addEventListener('focus', () => {
        populateSalesCustomers(custEl.value);
      });
      custEl.addEventListener('change', () => {
        const customerId = custEl.value;
        const orderEl = document.getElementById('salesOrderNo');
        if (orderEl) {
          if (customerId) {
            const postedInvoices = window.KYA_STORE.salesVouchers || [];
            const count = postedInvoices.filter(v => v.customerId == customerId).length;
            orderEl.value = count + 1;
          } else {
            orderEl.value = '';
          }
        }
      });
    }
    
    const execEl = document.getElementById('salesExecutive');
    if (execEl) {
      execEl.addEventListener('focus', () => {
        populateSalesExecutives(execEl.value);
      });
    }
    
    const supplyTypeEl = document.getElementById('salesSupplyType');
    if (supplyTypeEl) {
      supplyTypeEl.addEventListener('change', () => {
        handleSupplyTypeChange();
      });
    }
    
    const newCustBtn = document.getElementById('btnSalesNewCustomer');
    if (newCustBtn) {
      newCustBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showCoaModal('sg-tr');
      });
    }

    const payNotPaidBtn = document.getElementById('salesPaymentStatusNotPaid');
    const payFullBtn = document.getElementById('salesPaymentStatusFull');
    const payPartialBtn = document.getElementById('salesPaymentStatusPartial');
    const payBg = document.getElementById('salesPaymentStatusBg');
    const payAccField = document.getElementById('salesPaymentAccountField');
    const payAmtField = document.getElementById('salesPaymentAmountField');
    const payDueDateField = document.getElementById('salesDueDateField');
    
    if (payNotPaidBtn && payFullBtn && payPartialBtn && payBg && payAccField && payAmtField) {
      payNotPaidBtn.addEventListener('click', () => {
        payNotPaidBtn.classList.add('active');
        payFullBtn.classList.remove('active');
        payPartialBtn.classList.remove('active');
        payBg.className = 'sales-paystatus-bg notpaid-active';
        payAccField.style.display = 'none';
        payAmtField.style.display = 'none';
        if (payDueDateField) payDueDateField.style.display = 'flex';
        const wrapper = document.getElementById('salesDueDateWrapper');
        if (wrapper) {
          wrapper.style.flexDirection = 'row';
          wrapper.style.alignItems = 'center';
        }
        updateDueDateHelper();
        recalculateSalesTotals();
      });
      
      payFullBtn.addEventListener('click', () => {
        payFullBtn.classList.add('active');
        payNotPaidBtn.classList.remove('active');
        payPartialBtn.classList.remove('active');
        payBg.className = 'sales-paystatus-bg fullpaid-active';
        payAccField.style.display = 'flex';
        payAmtField.style.display = 'none';
        if (payDueDateField) payDueDateField.style.display = 'none';
        populateSalesPaymentAccounts();
        recalculateSalesTotals();
      });
      
      payPartialBtn.addEventListener('click', () => {
        payPartialBtn.classList.add('active');
        payNotPaidBtn.classList.remove('active');
        payFullBtn.classList.remove('active');
        payBg.className = 'sales-paystatus-bg partpaid-active';
        payAccField.style.display = 'flex';
        payAmtField.style.display = 'flex';
        if (payDueDateField) payDueDateField.style.display = 'flex';
        const wrapper = document.getElementById('salesDueDateWrapper');
        if (wrapper) {
          wrapper.style.flexDirection = 'column';
          wrapper.style.alignItems = 'flex-start';
          wrapper.style.gap = '4px';
        }
        updateDueDateHelper();
        populateSalesPaymentAccounts();
        recalculateSalesTotals();
      });
    }
    
    const payAccEl = document.getElementById('salesPaymentAccount');
    if (payAccEl) {
      payAccEl.addEventListener('focus', () => {
        populateSalesPaymentAccounts(payAccEl.value);
      });
    }
    
    const payAmtEl = document.getElementById('salesPaymentAmount');
    if (payAmtEl) {
      payAmtEl.addEventListener('input', () => {
        const subTotal = calculateSubtotal();
        let tdsTcsMode = 'None';
        const tdsBtn = document.getElementById('salesTdsTcsTds');
        const tcsBtn = document.getElementById('salesTdsTcsTcs');
        if (tdsBtn && tdsBtn.classList.contains('active')) tdsTcsMode = 'TDS';
        if (tcsBtn && tcsBtn.classList.contains('active')) tdsTcsMode = 'TCS';
        
        const rateSelect = document.getElementById('salesTdsTcsRateSelect');
        let rate = 0;
        if (tdsTcsMode !== 'None' && rateSelect) {
          if (rateSelect.value === 'custom') {
            const customInput = document.getElementById('salesTdsTcsRateCustom');
            rate = customInput ? (parseFloat(customInput.value) || 0) : 0;
          } else {
            rate = parseFloat(rateSelect.value) || 0;
          }
        }
        
        const amountInput = document.getElementById('salesTdsTcsAmount');
        const tdsTcsAmount = amountInput ? (parseFloat(amountInput.value) || 0) : 0;
        const adjustmentsInput = document.getElementById('salesAdjustments');
        const adjustments = adjustmentsInput ? (parseFloat(adjustmentsInput.value) || 0) : 0;
        
        let total = subTotal;
        if (tdsTcsMode === 'TDS') total = subTotal - tdsTcsAmount;
        else if (tdsTcsMode === 'TCS') total = subTotal + tdsTcsAmount;
        total += adjustments;
        
        const maxVal = getSalesPaymentMax(total);
        const orderNo = document.getElementById('salesOrderNo')?.value?.trim();
        const isOrderLinked = (currentSalesVoucherSubtype === 'Invoice' && orderNo);
        
        let orderAdvanceAmount = 0;
        if (isOrderLinked) {
          const linkedOrder = (window.KYA_STORE.salesVouchers || []).find(v => v.isOrder && v.invoiceNo.toLowerCase() === orderNo.toLowerCase());
          if (linkedOrder) {
            if (linkedOrder.paymentStatus === 'Full Payment') {
              orderAdvanceAmount = linkedOrder.total;
            } else if (linkedOrder.paymentStatus === 'Partial Payment') {
              orderAdvanceAmount = linkedOrder.paymentAmount || 0;
            }
          }
        }
        const excessAmount = Math.max(0, orderAdvanceAmount - total);
        const allowedMax = (isOrderLinked && excessAmount > 0) ? excessAmount : maxVal;
        
        if (parseFloat(payAmtEl.value) > allowedMax) {
          payAmtEl.value = allowedMax.toFixed(2);
          const limitMsg = (isOrderLinked && excessAmount > 0)
            ? `Refund Amount cannot exceed the excess refund amount of ₹${fmtNum(allowedMax)}.`
            : (isOrderLinked 
               ? `Payment Amount cannot exceed the balance payment of ₹${fmtNum(allowedMax)}.`
               : `Payment Amount cannot exceed the Grand Total of ₹${fmtNum(allowedMax)}.`);
          showToast(limitMsg, 'warning');
        }
      });
    }

    const returnBtn = document.getElementById('btnSalesReturn');
    const orderBtn = document.getElementById('btnSalesOrder');
    const rejectionBtn = document.getElementById('btnSalesRejection');
    
    if (returnBtn) {
      returnBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentSalesVoucherSubtype = 'Return';
        window._editingSalesInvoice = null;
        initSalesForm();
      });
    }
    if (orderBtn) {
      orderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentSalesVoucherSubtype = 'Order';
        window._editingSalesInvoice = null;
        initSalesForm();
      });
    }
    if (rejectionBtn) {
      rejectionBtn.addEventListener('click', () => {
        showToast('Rejection is an upcoming feature!', 'info');
      });
    }
  }

  function setupVoucherDeskEventListeners() {
    document.getElementById('vdNewJEBtn')?.addEventListener('click', () => {
      openTab('journal');
    });
    document.getElementById('vdNewInvBtn')?.addEventListener('click', () => {
      currentSalesVoucherSubtype = 'Invoice';
      window._editingSalesInvoice = null;
      initSalesForm();
      openTab('sales_voucher');
    });

    // Status tab switcher
    document.querySelectorAll('.vd-status-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _vdStatusFilter = btn.dataset.status;
        renderVoucherDeskPanel();
      });
    });
  }

