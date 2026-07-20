  // ══════════════════════════════════════════════════════════════════
  //  SALES FORM — Row rendering, totals calculation, invoice/order autofill, form init
  //  (Split from sales.js for maintainability)
  // ══════════════════════════════════════════════════════════════════

  function getNextAutoInvoiceNumber() {
    const year = new Date().getFullYear();
    if (currentSalesVoucherSubtype === 'Return') {
      const ctr = window.KYA_STORE.salesReturnCtr || 1;
      return `REV-${year}-${String(ctr).padStart(3, '0')}`;
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
      if (currentSalesVoucherSubtype === 'Return') ph = 'REV-2026-001';
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
    
    if (currentSalesVoucherSubtype === 'Return') {
      if (fullBtn && fullBtn.classList.contains('active')) return 'Full Refund';
      if (partBtn && partBtn.classList.contains('active')) return 'Partial Refund';
      return 'No Refund';
    }
    
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
      
      if (payAmtEl.value && total > 0) {
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

    if (currentSalesVoucherSubtype === 'Return') {
      activeBtn(returnBtn);
      if (cardTitle) cardTitle.textContent = 'Sales Reversal';
      if (cardSubtitle) cardSubtitle.textContent = 'Record sales reversals and customer credits';
      if (invoiceNoContainer) invoiceNoContainer.style.display = 'block';
      if (invoiceNoLabel) invoiceNoLabel.textContent = 'Original Doc';
      if (invoiceNoInput) invoiceNoInput.style.display = 'none';
      if (selectWrap) {
        selectWrap.style.display = 'block';
        refreshSalesInvoiceDropdownOptions();
      }
      if (orderNoContainer) orderNoContainer.style.display = 'block';
      if (postSalesBtn) {
        postSalesBtn.innerHTML = `<svg viewBox="0 0 15 15" fill="none" style="width:14px; height:14px; margin-right:6px; display:inline-block; vertical-align:middle;"><path d="M2.5 8l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> Post Reversal`;
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
    
    // Get all posted invoices/orders that are NOT returns and NOT completely returned
    const invoices = (window.KYA_STORE.salesVouchers || []).filter(v => {
      if (v.isReturn) return false;
      if (v.isOrder) {
        // Only show orders that have NOT been converted to a sale (Invoice)
        const isConverted = (window.KYA_STORE.salesVouchers || []).some(inv => !inv.isOrder && !inv.isReturn && inv.orderNo && inv.orderNo.toLowerCase() === v.invoiceNo.toLowerCase());
        if (isConverted) return false;
      }
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
      const docType = inv.isOrder ? 'Order' : 'Inv';
      const text = `${docType}: ${inv.invoiceNo} - ${custName} (${inv.date}) - ₹${fmtNum(inv.total)}`;
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
      noResult.textContent = 'No matching documents';
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
      const docLabel = inv.isOrder ? 'order' : 'invoice';
      notesEl.value = `Return against ${docLabel} ${inv.invoiceNo}. ${inv.notes || ''}`;
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
    updateSalesReturnLockState();
    recalculateSalesTotals();
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
    if (triggerText) triggerText.textContent = 'Select Invoice/Order';

    salesRows = [];
    addSalesRow();
    updateSalesReturnLockState();
  }

