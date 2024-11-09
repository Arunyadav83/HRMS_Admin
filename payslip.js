$(document).ready(function() {
    // Initialize payslip datatable
    let payslipTable = $('#payslip_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/payslips',
            type: 'GET',
            data: function(d) {
                d.month = $('#payslip_month').val();
                d.year = $('#payslip_year').val();
                d.department = $('#department_filter').val();
                d.status = $('#status_filter').val();
            }
        },
        columns: [
            { 
                data: 'select',
                title: '<input type="checkbox" id="select_all_payslips">',
                orderable: false,
                render: function(data, type, row) {
                    return `<input type="checkbox" class="payslip-checkbox" value="${row.id}">`;
                }
            },
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'department', title: 'Department' },
            { data: 'designation', title: 'Designation' },
            { data: 'gross_salary', title: 'Gross Salary' },
            { data: 'net_salary', title: 'Net Salary' },
            { data: 'status', title: 'Status' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: [5, 6], // amount columns
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: 7, // status column
                render: function(data) {
                    const statusClasses = {
                        'pending': 'bg-warning',
                        'generated': 'bg-success',
                        'emailed': 'bg-info'
                    };
                    return `<span class="badge ${statusClasses[data.toLowerCase()]}">${data}</span>`;
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    return `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-payslip" data-id="${row.id}">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary download-payslip" data-id="${row.id}">
                                <i class="fa fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-success email-payslip" data-id="${row.id}">
                                <i class="fa fa-envelope"></i>
                            </button>
                        </div>`;
                }
            }
        ],
        order: [[2, 'asc']],
        pageLength: 25,
        responsive: true,
        footerCallback: function(row, data, start, end, display) {
            calculateTotals(this.api());
        }
    });

    // Select all checkbox handler
    $('#select_all_payslips').on('change', function() {
        $('.payslip-checkbox').prop('checked', $(this).prop('checked'));
        updateBulkActionButtons();
    });

    // Individual checkbox handler
    $(document).on('change', '.payslip-checkbox', function() {
        updateBulkActionButtons();
    });

    // Initialize period controls
    initializePeriodControls();

    // Filter handlers
    $('.payslip-filter').on('change', function() {
        payslipTable.ajax.reload();
    });

    // Generate Payslips
    $('#generate_payslips').on('click', function() {
        const selectedIds = getSelectedPayslips();
        if (selectedIds.length === 0) {
            showErrorAlert('Please select employees');
            return;
        }

        if (confirm('Are you sure you want to generate payslips?')) {
            generatePayslips(selectedIds);
        }
    });

    function generatePayslips(employeeIds) {
        $.ajax({
            url: '/api/payslips/generate',
            method: 'POST',
            data: {
                employee_ids: employeeIds,
                month: $('#payslip_month').val(),
                year: $('#payslip_year').val()
            },
            success: function(response) {
                payslipTable.ajax.reload();
                showSuccessAlert('Payslips generated successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error generating payslips: ' + xhr.responseJSON.message);
            }
        });
    }

    // View Payslip
    $(document).on('click', '.view-payslip', function() {
        const payslipId = $(this).data('id');
        viewPayslip(payslipId);
    });

    function viewPayslip(payslipId) {
        $.ajax({
            url: `/api/payslips/${payslipId}`,
            method: 'GET',
            success: function(response) {
                showPayslipModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading payslip');
            }
        });
    }

    function showPayslipModal(payslip) {
        // Employee Information
        $('#emp_name').text(payslip.employee_name);
        $('#emp_id').text(payslip.employee_id);
        $('#emp_department').text(payslip.department);
        $('#emp_designation').text(payslip.designation);
        $('#pay_period').text(`${payslip.month} ${payslip.year}`);

        // Earnings
        let earningsHtml = '';
        payslip.earnings.forEach(item => {
            earningsHtml += `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-end">${formatCurrency(item.amount)}</td>
                </tr>`;
        });
        $('#earnings_list').html(earningsHtml);
        $('#total_earnings').text(formatCurrency(payslip.total_earnings));

        // Deductions
        let deductionsHtml = '';
        payslip.deductions.forEach(item => {
            deductionsHtml += `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-end">${formatCurrency(item.amount)}</td>
                </tr>`;
        });
        $('#deductions_list').html(deductionsHtml);
        $('#total_deductions').text(formatCurrency(payslip.total_deductions));

        // Net Salary
        $('#net_salary').text(formatCurrency(payslip.net_salary));

        $('#payslip_modal').modal('show');
    }

    // Download Payslip
    $(document).on('click', '.download-payslip', function() {
        const payslipId = $(this).data('id');
        downloadPayslip(payslipId);
    });

    function downloadPayslip(payslipId) {
        $.ajax({
            url: `/api/payslips/${payslipId}/download`,
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payslip_${payslipId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error downloading payslip');
            }
        });
    }

    // Email Payslip
    $(document).on('click', '.email-payslip', function() {
        const payslipId = $(this).data('id');
        emailPayslip(payslipId);
    });

    function emailPayslip(payslipId) {
        $.ajax({
            url: `/api/payslips/${payslipId}/email`,
            method: 'POST',
            success: function(response) {
                showSuccessAlert('Payslip sent successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error sending payslip');
            }
        });
    }

    // Bulk Email Payslips
    $('#email_payslips').on('click', function() {
        const selectedIds = getSelectedPayslips();
        if (selectedIds.length === 0) {
            showErrorAlert('Please select payslips to email');
            return;
        }

        if (confirm('Are you sure you want to email these payslips?')) {
            emailBulkPayslips(selectedIds);
        }
    });

    function emailBulkPayslips(payslipIds) {
        $.ajax({
            url: '/api/payslips/email-bulk',
            method: 'POST',
            data: { payslip_ids: payslipIds },
            success: function(response) {
                payslipTable.ajax.reload();
                showSuccessAlert('Payslips emailed successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error emailing payslips');
            }
        });
    }

    // Export Payslips
    $('#export_payslips').on('click', function() {
        const format = $('#export_format').val();
        exportPayslips(format);
    });

    function exportPayslips(format) {
        const params = {
            month: $('#payslip_month').val(),
            year: $('#payslip_year').val(),
            department: $('#department_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/payslips/export',
            method: 'GET',
            data: params,
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { 
                    type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payslips_${params.month}_${params.year}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting payslips');
            }
        });
    }

    // Helper Functions
    function getSelectedPayslips() {
        return $('.payslip-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
    }

    function updateBulkActionButtons() {
        const selectedCount = $('.payslip-checkbox:checked').length;
        $('#generate_payslips, #email_payslips').prop('disabled', selectedCount === 0);
        $('#selected_count').text(selectedCount);
    }

    function calculateTotals(api) {
        const totalGross = api
            .column(5)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        
        const totalNet = api
            .column(6)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_gross').text(formatCurrency(totalGross));
        $('#total_net').text(formatCurrency(totalNet));
    }

    function initializePeriodControls() {
        // Populate months
        const months = moment.months();
        const currentMonth = moment().month();
        
        months.forEach((month, index) => {
            $('#payslip_month').append(
                `<option value="${index + 1}" ${index === currentMonth ? 'selected' : ''}>
                    ${month}
                </option>`
            );
        });

        // Populate years
        const currentYear = moment().year();
        for (let i = currentYear - 2; i <= currentYear; i++) {
            $('#payslip_year').append(
                `<option value="${i}" ${i === currentYear ? 'selected' : ''}>
                    ${i}
                </option>`
            );
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function showSuccessAlert(message) {
        toastr.success(message);
    }

    function showErrorAlert(message) {
        toastr.error(message);
    }
}); 