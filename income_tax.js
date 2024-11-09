$(document).ready(function() {
    // Initialize income tax datatable
    let taxTable = $('#income_tax_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/income-tax',
            type: 'GET',
            data: function(d) {
                d.year = $('#tax_year').val();
                d.month = $('#tax_month').val();
                d.department = $('#department_filter').val();
            }
        },
        columns: [
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'gross_salary', title: 'Gross Salary' },
            { data: 'taxable_income', title: 'Taxable Income' },
            { data: 'deductions', title: 'Deductions' },
            { data: 'tax_amount', title: 'Tax Amount' },
            { data: 'net_salary', title: 'Net Salary' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: [2, 3, 4, 5, 6], // amount columns
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
                                <i class="fa fa-eye"></i> Details
                            </button>
                            <button class="btn btn-sm btn-primary calculate-tax" data-id="${row.employee_id}">
                                <i class="fa fa-calculator"></i> Recalculate
                            </button>
                        </div>`;
                }
            }
        ],
        order: [[1, 'asc']],
        pageLength: 25,
        responsive: true,
        footerCallback: function(row, data, start, end, display) {
            calculateTotalTax(this.api());
        }
    });

    // Tax year and month filter handlers
    $('.tax-filter').on('change', function() {
        taxTable.ajax.reload();
    });

    // Tax calculation handler
    $(document).on('click', '.calculate-tax', function() {
        const employeeId = $(this).data('id');
        calculateEmployeeTax(employeeId);
    });

    // Bulk tax calculation
    $('#calculate_all_tax').on('click', function() {
        calculateBulkTax();
    });

    // View tax details handler
    $(document).on('click', '.view-details', function() {
        const employeeId = $(this).data('id');
        loadTaxDetails(employeeId);
    });

    // Tax Components Calculator
    function calculateTaxComponents(grossSalary, deductions = {}) {
        const taxableIncome = calculateTaxableIncome(grossSalary, deductions);
        const taxBrackets = getTaxBrackets();
        let totalTax = 0;

        for (const bracket of taxBrackets) {
            if (taxableIncome > bracket.min) {
                const taxableAmount = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
                totalTax += taxableAmount * (bracket.rate / 100);
            }
        }

        return {
            grossSalary: grossSalary,
            taxableIncome: taxableIncome,
            totalDeductions: Object.values(deductions).reduce((a, b) => a + b, 0),
            taxAmount: totalTax,
            netSalary: taxableIncome - totalTax
        };
    }

    function calculateTaxableIncome(grossSalary, deductions) {
        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
        return grossSalary - totalDeductions;
    }

    function getTaxBrackets() {
        // Example tax brackets (should be configured based on local tax laws)
        return [
            { min: 0, max: 50000, rate: 10 },
            { min: 50000, max: 100000, rate: 20 },
            { min: 100000, max: 150000, rate: 30 },
            { min: 150000, max: Infinity, rate: 35 }
        ];
    }

    // API Calls
    function calculateEmployeeTax(employeeId) {
        $.ajax({
            url: `/api/income-tax/calculate/${employeeId}`,
            method: 'POST',
            data: {
                year: $('#tax_year').val(),
                month: $('#tax_month').val()
            },
            success: function(response) {
                taxTable.ajax.reload();
                showSuccessAlert('Tax calculation completed');
            },
            error: function(xhr) {
                showErrorAlert('Error calculating tax');
            }
        });
    }

    function calculateBulkTax() {
        $.ajax({
            url: '/api/income-tax/calculate-bulk',
            method: 'POST',
            data: {
                year: $('#tax_year').val(),
                month: $('#tax_month').val(),
                department: $('#department_filter').val()
            },
            success: function(response) {
                taxTable.ajax.reload();
                showSuccessAlert('Bulk tax calculation completed');
            },
            error: function(xhr) {
                showErrorAlert('Error calculating bulk tax');
            }
        });
    }

    function loadTaxDetails(employeeId) {
        $.ajax({
            url: `/api/income-tax/details/${employeeId}`,
            method: 'GET',
            data: {
                year: $('#tax_year').val(),
                month: $('#tax_month').val()
            },
            success: function(response) {
                showTaxDetailsModal(response);
            },
            error: function(xhr) {
                showErrorAlert('Error loading tax details');
            }
        });
    }

    // UI Helpers
    function showTaxDetailsModal(details) {
        $('#employee_name_display').text(details.employee_name);
        $('#gross_salary_display').text(formatCurrency(details.gross_salary));
        $('#taxable_income_display').text(formatCurrency(details.taxable_income));
        
        // Populate deductions breakdown
        let deductionsHtml = '';
        for (const [key, value] of Object.entries(details.deductions)) {
            deductionsHtml += `
                <tr>
                    <td>${key}</td>
                    <td>${formatCurrency(value)}</td>
                </tr>`;
        }
        $('#deductions_breakdown').html(deductionsHtml);

        // Populate tax brackets breakdown
        let taxBreakdownHtml = '';
        details.tax_breakdown.forEach(bracket => {
            taxBreakdownHtml += `
                <tr>
                    <td>${formatCurrency(bracket.from)} - ${formatCurrency(bracket.to)}</td>
                    <td>${bracket.rate}%</td>
                    <td>${formatCurrency(bracket.tax_amount)}</td>
                </tr>`;
        });
        $('#tax_breakdown').html(taxBreakdownHtml);

        $('#total_tax_display').text(formatCurrency(details.total_tax));
        $('#net_salary_display').text(formatCurrency(details.net_salary));

        $('#tax_details_modal').modal('show');
    }

    function calculateTotalTax(api) {
        const totalTax = api
            .column(5)
            .data()
            .reduce((a, b) => parseFloat(b.replace(/[^0-9.-]+/g, '')) + a, 0);

        $('#total_tax_amount').text(formatCurrency(totalTax));
    }

    // Export functionality
    $('#export_tax_report').on('click', function() {
        const format = $('#export_format').val();
        exportTaxReport(format);
    });

    function exportTaxReport(format) {
        const params = {
            year: $('#tax_year').val(),
            month: $('#tax_month').val(),
            department: $('#department_filter').val(),
            format: format
        };

        $.ajax({
            url: '/api/income-tax/export',
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
                a.download = `tax_report_${params.year}_${params.month}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting tax report');
            }
        });
    }

    // Utility functions
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