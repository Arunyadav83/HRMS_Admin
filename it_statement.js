$(document).ready(function() {
    // Initialize IT statement datatable
    let itStatementTable = $('#it_statement_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/it-statements',
            type: 'GET',
            data: function(d) {
                d.financial_year = $('#financial_year').val();
                d.department = $('#department_filter').val();
                d.status = $('#status_filter').val();
            }
        },
        columns: [
            { 
                data: 'select',
                title: '<input type="checkbox" id="select_all_statements">',
                orderable: false,
                render: function(data, type, row) {
                    return `<input type="checkbox" class="statement-checkbox" value="${row.id}">`;
                }
            },
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'pan_number', title: 'PAN Number' },
            { data: 'gross_salary', title: 'Gross Salary' },
            { data: 'total_deductions', title: 'Total Deductions' },
            { data: 'taxable_income', title: 'Taxable Income' },
            { data: 'tax_payable', title: 'Tax Payable' },
            { data: 'status', title: 'Status' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: [4, 5, 6, 7], // amount columns
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: 8, // status column
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
                            <button class="btn btn-sm btn-info view-statement" data-id="${row.id}">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary download-statement" data-id="${row.id}">
                                <i class="fa fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-success email-statement" data-id="${row.id}">
                                <i class="fa fa-envelope"></i>
                            </button>
                            <button class="btn btn-sm btn-warning view-computation" data-id="${row.id}">
                                <i class="fa fa-calculator"></i>
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
    $('#select_all_statements').on('change', function() {
        $('.statement-checkbox').prop('checked', $(this).prop('checked'));
        updateBulkActionButtons();
    });

    // Individual checkbox handler
    $(document).on('change', '.statement-checkbox', function() {
        updateBulkActionButtons();
    });

    // Initialize financial year control
    initializeFinancialYearControl();

    // Filter handlers
    $('.statement-filter').on('change', function() {
        itStatementTable.ajax.reload();
    });

    // Generate IT Statements
    $('#generate_statements').on('click', function() {
        const selectedIds = getSelectedStatements();
        if (selectedIds.length === 0) {
            showErrorAlert('Please select employees');
            return;
        }

        if (confirm('Are you sure you want to generate IT statements?')) {
            generateITStatements(selectedIds);
        }
    });

    function generateITStatements(employeeIds) {
        $.ajax({
            url: '/api/it-statements/generate',
            method: 'POST',
            data: {
                employee_ids: employeeIds,
                financial_year: $('#financial_year').val()
            },
            success: function(response) {
                itStatementTable.ajax.reload();
                showSuccessAlert('IT statements generated successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error generating IT statements: ' + xhr.responseJSON.message);
            }
        });
    }

    // View IT Statement
    $(document).on('click', '.view-statement', function() {
        const statementId = $(this).data('id');
        viewITStatement(statementId);
    });

    function viewITStatement(statementId) {
        $.ajax({
            url: `/api/it-statements/${statementId}`,
            method: 'GET',
            success: function(response) {
                showStatementModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading IT statement');
            }
        });
    }

    function showStatementModal(statement) {
        // Employee Information
        $('#emp_name').text(statement.employee_name);
        $('#emp_id').text(statement.employee_id);
        $('#pan_number').text(statement.pan_number);
        $('#financial_year_display').text(statement.financial_year);

        // Income Details
        $('#gross_salary').text(formatCurrency(statement.gross_salary));
        $('#other_income').text(formatCurrency(statement.other_income));
        $('#total_income').text(formatCurrency(statement.total_income));

        // Deductions
        let deductionsHtml = '';
        statement.deductions.forEach(item => {
            deductionsHtml += `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-end">${formatCurrency(item.amount)}</td>
                </tr>`;
        });
        $('#deductions_list').html(deductionsHtml);
        $('#total_deductions').text(formatCurrency(statement.total_deductions));

        // Tax Computation
        $('#taxable_income').text(formatCurrency(statement.taxable_income));
        $('#tax_payable').text(formatCurrency(statement.tax_payable));
        $('#tax_paid').text(formatCurrency(statement.tax_paid));
        $('#tax_balance').text(formatCurrency(statement.tax_balance));

        $('#statement_modal').modal('show');
    }

    // View Tax Computation
    $(document).on('click', '.view-computation', function() {
        const statementId = $(this).data('id');
        viewTaxComputation(statementId);
    });

    function viewTaxComputation(statementId) {
        $.ajax({
            url: `/api/it-statements/${statementId}/computation`,
            method: 'GET',
            success: function(response) {
                showComputationModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading tax computation');
            }
        });
    }

    // Download Statement
    $(document).on('click', '.download-statement', function() {
        const statementId = $(this).data('id');
        downloadStatement(statementId);
    });

    function downloadStatement(statementId) {
        $.ajax({
            url: `/api/it-statements/${statementId}/download`,
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `it_statement_${statementId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error downloading statement');
            }
        });
    }

    // Email Statement
    $(document).on('click', '.email-statement', function() {
        const statementId = $(this).data('id');
        emailStatement(statementId);
    });

    function emailStatement(statementId) {
        $.ajax({
            url: `/api/it-statements/${statementId}/email`,
            method: 'POST',
            success: function(response) {
                showSuccessAlert('Statement sent successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error sending statement');
            }
        });
    }

    // Bulk Email Statements
    $('#email_statements').on('click', function() {
        const selectedIds = getSelectedStatements();
        if (selectedIds.length === 0) {
            showErrorAlert('Please select statements to email');
            return;
        }

        if (confirm('Are you sure you want to email these statements?')) {
            emailBulkStatements(selectedIds);
        }
    });

    function emailBulkStatements(statementIds) {
        $.ajax({
            url: '/api/it-statements/email-bulk',
            method: 'POST',
            data: { statement_ids: statementIds },
            success: function(response) {
                itStatementTable.ajax.reload();
                showSuccessAlert('Statements emailed successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error emailing statements');
            }
        });
    }

    // Export Statements
    $('#export_statements').on('click', function() {
        const format = $('#export_format').val();
        exportStatements(format);
    });

    function exportStatements(format) {
        const params = {
            financial_year: $('#financial_year').val(),
            department: $('#department_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/it-statements/export',
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
                a.download = `it_statements_${params.financial_year}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting statements');
            }
        });
    }

    // Helper Functions
    function getSelectedStatements() {
        return $('.statement-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
    }

    function updateBulkActionButtons() {
        const selectedCount = $('.statement-checkbox:checked').length;
        $('#generate_statements, #email_statements').prop('disabled', selectedCount === 0);
        $('#selected_count').text(selectedCount);
    }

    function calculateTotals(api) {
        const totalGross = api
            .column(4)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        
        const totalTax = api
            .column(7)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_gross').text(formatCurrency(totalGross));
        $('#total_tax').text(formatCurrency(totalTax));
    }

    function initializeFinancialYearControl() {
        const currentYear = moment().year();
        for (let i = currentYear - 2; i <= currentYear; i++) {
            const fy = `${i}-${i + 1}`;
            $('#financial_year').append(
                `<option value="${fy}" ${i === currentYear ? 'selected' : ''}>
                    ${fy}
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