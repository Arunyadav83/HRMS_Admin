$(document).ready(function() {
    // Initialize payroll process datatable
    let payrollTable = $('#payroll_process_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/payroll-process',
            type: 'GET',
            data: function(d) {
                d.month = $('#process_month').val();
                d.year = $('#process_year').val();
                d.department = $('#department_filter').val();
                d.status = $('#status_filter').val();
            }
        },
        columns: [
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'department', title: 'Department' },
            { data: 'basic_salary', title: 'Basic Salary' },
            { data: 'allowances', title: 'Allowances' },
            { data: 'deductions', title: 'Deductions' },
            { data: 'net_salary', title: 'Net Salary' },
            { data: 'status', title: 'Status' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: [3, 4, 5, 6], // amount columns
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: 7, // status column
                render: function(data) {
                    const statusClasses = {
                        'pending': 'bg-warning',
                        'processing': 'bg-info',
                        'completed': 'bg-success',
                        'error': 'bg-danger'
                    };
                    return `<span class="badge ${statusClasses[data.toLowerCase()]}">${data}</span>`;
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    let actions = `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-details" data-id="${row.employee_id}">
                                <i class="fa fa-eye"></i>
                            </button>`;
                    
                    if (row.status.toLowerCase() === 'error') {
                        actions += `
                            <button class="btn btn-sm btn-warning reprocess" data-id="${row.employee_id}">
                                <i class="fa fa-refresh"></i>
                            </button>`;
                    }
                    
                    actions += `
                            <button class="btn btn-sm btn-primary view-payslip" data-id="${row.employee_id}">
                                <i class="fa fa-file-text"></i>
                            </button>
                        </div>`;
                    return actions;
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

    // Initialize process controls
    initializeProcessControls();

    // Filter handlers
    $('.payroll-filter').on('change', function() {
        payrollTable.ajax.reload();
    });

    // Start Payroll Process
    $('#start_payroll_process').on('click', function() {
        if (confirm('Are you sure you want to start payroll processing?')) {
            startPayrollProcess();
        }
    });

    function startPayrollProcess() {
        const processData = {
            month: $('#process_month').val(),
            year: $('#process_year').val(),
            department: $('#department_filter').val()
        };

        $.ajax({
            url: '/api/payroll-process/start',
            method: 'POST',
            data: processData,
            success: function(response) {
                initializeProgressMonitor(response.process_id);
                showSuccessAlert('Payroll processing started');
            },
            error: function(xhr) {
                showErrorAlert('Error starting payroll process: ' + xhr.responseJSON.message);
            }
        });
    }

    // Progress Monitor
    function initializeProgressMonitor(processId) {
        $('#process_status_card').show();
        updateProgressStatus(processId);
        
        const progressInterval = setInterval(function() {
            $.ajax({
                url: `/api/payroll-process/status/${processId}`,
                method: 'GET',
                success: function(response) {
                    updateProgressUI(response);
                    
                    if (response.status === 'completed' || response.status === 'error') {
                        clearInterval(progressInterval);
                        payrollTable.ajax.reload();
                        
                        if (response.status === 'completed') {
                            showSuccessAlert('Payroll processing completed successfully');
                        }
                    }
                }
            });
        }, 5000); // Check every 5 seconds
    }

    function updateProgressUI(status) {
        $('#process_progress').css('width', status.progress + '%');
        $('#process_progress').text(status.progress + '%');
        $('#processed_count').text(status.processed);
        $('#total_count').text(status.total);
        $('#error_count').text(status.errors);
    }

    // View Details
    $(document).on('click', '.view-details', function() {
        const employeeId = $(this).data('id');
        loadPayrollDetails(employeeId);
    });

    function loadPayrollDetails(employeeId) {
        $.ajax({
            url: `/api/payroll-process/details/${employeeId}`,
            method: 'GET',
            data: {
                month: $('#process_month').val(),
                year: $('#process_year').val()
            },
            success: function(response) {
                showPayrollDetailsModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading payroll details');
            }
        });
    }

    function showPayrollDetailsModal(details) {
        // Populate earnings breakdown
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

        // Populate deductions breakdown
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

        // Set other details
        $('#employee_name_display').text(details.employee_name);
        $('#net_salary_display').text(formatCurrency(details.net_salary));

        $('#payroll_details_modal').modal('show');
    }

    // Reprocess Individual
    $(document).on('click', '.reprocess', function() {
        const employeeId = $(this).data('id');
        reprocessPayroll(employeeId);
    });

    function reprocessPayroll(employeeId) {
        $.ajax({
            url: '/api/payroll-process/reprocess',
            method: 'POST',
            data: {
                employee_id: employeeId,
                month: $('#process_month').val(),
                year: $('#process_year').val()
            },
            success: function(response) {
                payrollTable.ajax.reload();
                showSuccessAlert('Payroll reprocessed successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error reprocessing payroll');
            }
        });
    }

    // View/Download Payslip
    $(document).on('click', '.view-payslip', function() {
        const employeeId = $(this).data('id');
        generatePayslip(employeeId);
    });

    function generatePayslip(employeeId) {
        $.ajax({
            url: '/api/payroll-process/payslip',
            method: 'GET',
            data: {
                employee_id: employeeId,
                month: $('#process_month').val(),
                year: $('#process_year').val()
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
                showErrorAlert('Error generating payslip');
            }
        });
    }

    // Export functionality
    $('#export_payroll').on('click', function() {
        const format = $('#export_format').val();
        exportPayrollReport(format);
    });

    function exportPayrollReport(format) {
        const params = {
            month: $('#process_month').val(),
            year: $('#process_year').val(),
            department: $('#department_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/payroll-process/export',
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
                a.download = `payroll_${params.year}_${params.month}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting payroll report');
            }
        });
    }

    // Helper Functions
    function calculateTotals(api) {
        const totalBasic = api.column(3).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        const totalAllowances = api.column(4).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        const totalDeductions = api.column(5).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);
        const totalNet = api.column(6).data().reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_basic').text(formatCurrency(totalBasic));
        $('#total_allowances').text(formatCurrency(totalAllowances));
        $('#total_deductions').text(formatCurrency(totalDeductions));
        $('#total_net').text(formatCurrency(totalNet));
    }

    function initializeProcessControls() {
        // Populate months
        const months = moment.months();
        const currentMonth = moment().month();
        
        months.forEach((month, index) => {
            $('#process_month').append(
                `<option value="${index + 1}" ${index === currentMonth ? 'selected' : ''}>
                    ${month}
                </option>`
            );
        });

        // Populate years
        const currentYear = moment().year();
        for (let i = currentYear - 2; i <= currentYear; i++) {
            $('#process_year').append(
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