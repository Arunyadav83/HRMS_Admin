$(document).ready(function() {
    // Initialize quick salary statement datatable
    let statementTable = $('#quick_salary_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/quick-salary-statement',
            type: 'GET',
            data: function(d) {
                d.from_date = $('#from_date').val();
                d.to_date = $('#to_date').val();
                d.department = $('#department_filter').val();
                d.employee_type = $('#employee_type').val();
            }
        },
        columns: [
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'department', title: 'Department' },
            { data: 'designation', title: 'Designation' },
            { data: 'working_days', title: 'Working Days' },
            { data: 'basic_salary', title: 'Basic Salary' },
            { data: 'allowances', title: 'Allowances' },
            { data: 'overtime', title: 'Overtime' },
            { data: 'deductions', title: 'Deductions' },
            { data: 'net_salary', title: 'Net Salary' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: [5, 6, 7, 8, 9], // amount columns
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    return `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-details" data-id="${row.employee_id}">
                                <i class="fa fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary generate-statement" data-id="${row.employee_id}">
                                <i class="fa fa-file-pdf-o"></i>
                            </button>
                            <button class="btn btn-sm btn-success send-email" data-id="${row.employee_id}">
                                <i class="fa fa-envelope"></i>
                            </button>
                        </div>`;
                }
            }
        ],
        order: [[1, 'asc']],
        pageLength: 25,
        responsive: true,
        footerCallback: function(row, data, start, end, display) {
            calculateTotals(this.api());
        }
    });

    // Date range picker initialization
    $('#date_range').daterangepicker({
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month'),
        ranges: {
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            'Last 3 Months': [moment().subtract(3, 'month').startOf('month'), moment().endOf('month')],
            'This Year': [moment().startOf('year'), moment().endOf('year')]
        }
    }, function(start, end) {
        $('#from_date').val(start.format('YYYY-MM-DD'));
        $('#to_date').val(end.format('YYYY-MM-DD'));
        statementTable.ajax.reload();
    });

    // Filter handlers
    $('.statement-filter').on('change', function() {
        statementTable.ajax.reload();
    });

    // View Details
    $(document).on('click', '.view-details', function() {
        const employeeId = $(this).data('id');
        loadSalaryDetails(employeeId);
    });

    function loadSalaryDetails(employeeId) {
        $.ajax({
            url: `/api/quick-salary-statement/details/${employeeId}`,
            method: 'GET',
            data: {
                from_date: $('#from_date').val(),
                to_date: $('#to_date').val()
            },
            success: function(response) {
                showDetailsModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading salary details');
            }
        });
    }

    function showDetailsModal(details) {
        // Employee Information
        $('#employee_name_display').text(details.employee_name);
        $('#employee_id_display').text(details.employee_id);
        $('#department_display').text(details.department);
        $('#designation_display').text(details.designation);
        $('#period_display').text(`${moment(details.from_date).format('DD MMM YYYY')} - ${moment(details.to_date).format('DD MMM YYYY')}`);

        // Earnings Breakdown
        let earningsHtml = '';
        details.earnings.forEach(item => {
            earningsHtml += `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-end">${formatCurrency(item.amount)}</td>
                </tr>`;
        });
        $('#earnings_breakdown').html(earningsHtml);
        $('#total_earnings').text(formatCurrency(details.total_earnings));

        // Deductions Breakdown
        let deductionsHtml = '';
        details.deductions.forEach(item => {
            deductionsHtml += `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-end">${formatCurrency(item.amount)}</td>
                </tr>`;
        });
        $('#deductions_breakdown').html(deductionsHtml);
        $('#total_deductions').text(formatCurrency(details.total_deductions));

        // Net Salary
        $('#net_salary_display').text(formatCurrency(details.net_salary));

        $('#salary_details_modal').modal('show');
    }

    // Generate Statement
    $(document).on('click', '.generate-statement', function() {
        const employeeId = $(this).data('id');
        generateSalaryStatement(employeeId);
    });

    function generateSalaryStatement(employeeId) {
        $.ajax({
            url: '/api/quick-salary-statement/generate',
            method: 'POST',
            data: {
                employee_id: employeeId,
                from_date: $('#from_date').val(),
                to_date: $('#to_date').val()
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            },
            error: function(xhr) {
                showErrorAlert('Error generating salary statement');
            }
        });
    }

    // Send Email
    $(document).on('click', '.send-email', function() {
        const employeeId = $(this).data('id');
        sendStatementEmail(employeeId);
    });

    function sendStatementEmail(employeeId) {
        $.ajax({
            url: '/api/quick-salary-statement/send-email',
            method: 'POST',
            data: {
                employee_id: employeeId,
                from_date: $('#from_date').val(),
                to_date: $('#to_date').val()
            },
            success: function(response) {
                showSuccessAlert('Salary statement sent successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error sending salary statement');
            }
        });
    }

    // Bulk Actions
    $('#generate_bulk_statements').on('click', function() {
        const selectedIds = getSelectedEmployees();
        if (selectedIds.length === 0) {
            showErrorAlert('Please select employees');
            return;
        }
        generateBulkStatements(selectedIds);
    });

    function getSelectedEmployees() {
        return $('.employee-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
    }

    function generateBulkStatements(employeeIds) {
        $.ajax({
            url: '/api/quick-salary-statement/generate-bulk',
            method: 'POST',
            data: {
                employee_ids: employeeIds,
                from_date: $('#from_date').val(),
                to_date: $('#to_date').val()
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            },
            error: function(xhr) {
                showErrorAlert('Error generating bulk statements');
            }
        });
    }

    // Export functionality
    $('#export_salary_data').on('click', function() {
        const format = $('#export_format').val();
        exportSalaryData(format);
    });

    function exportSalaryData(format) {
        const params = {
            from_date: $('#from_date').val(),
            to_date: $('#to_date').val(),
            department: $('#department_filter').val(),
            employee_type: $('#employee_type').val(),
            format: format
        };

        $.ajax({
            url: '/api/quick-salary-statement/export',
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
                a.download = `salary_statement_${moment().format('YYYYMMDD')}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting salary data');
            }
        });
    }

    // Helper Functions
    function calculateTotals(api) {
        const totalBasic = api.column(5).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        const totalAllowances = api.column(6).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        const totalOvertime = api.column(7).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        const totalDeductions = api.column(8).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        const totalNet = api.column(9).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_basic').text(formatCurrency(totalBasic));
        $('#total_allowances').text(formatCurrency(totalAllowances));
        $('#total_overtime').text(formatCurrency(totalOvertime));
        $('#total_deductions').text(formatCurrency(totalDeductions));
        $('#total_net').text(formatCurrency(totalNet));
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