$(document).ready(function() {
    // Initialize employee salary datatable
    let salaryTable = $('#employee_salary_table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '/api/employee-salaries',
            type: 'GET'
        },
        columns: [
            { data: 'employee_id', title: 'Employee ID' },
            { data: 'employee_name', title: 'Employee Name' },
            { data: 'department', title: 'Department' },
            { data: 'position', title: 'Position' },
            { data: 'current_salary', title: 'Current Salary' },
            { data: 'last_revision_date', title: 'Last Revision' },
            { data: 'actions', title: 'Actions', orderable: false }
        ],
        columnDefs: [
            {
                targets: 4, // current_salary column
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: 5, // last_revision_date column
                render: function(data) {
                    return moment(data).format('DD MMM YYYY');
                }
            },
            {
                targets: -1, // actions column
                render: function(data, type, row) {
                    return `
                        <div class="btn-group">
                            <button class="btn btn-sm btn-info view-history" data-id="${row.employee_id}">
                                <i class="fa fa-history"></i> History
                            </button>
                            <button class="btn btn-sm btn-primary revise-salary" data-id="${row.employee_id}">
                                <i class="fa fa-edit"></i> Revise
                            </button>
                        </div>`;
                }
            }
        ],
        order: [[1, 'asc']],
        pageLength: 25,
        responsive: true
    });

    // Salary revision modal handler
    $('#revise_salary_form').on('submit', function(e) {
        e.preventDefault();
        
        let formData = {
            employee_id: $('#employee_id').val(),
            current_salary: parseFloat($('#current_salary').val()),
            new_salary: parseFloat($('#new_salary').val()),
            effective_date: $('#effective_date').val(),
            revision_reason: $('#revision_reason').val(),
            notes: $('#revision_notes').val()
        };

        $.ajax({
            url: '/api/employee-salaries/revise',
            method: 'POST',
            data: formData,
            success: function(response) {
                $('#salary_revision_modal').modal('hide');
                salaryTable.ajax.reload();
                showSuccessAlert('Salary revised successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error revising salary: ' + xhr.responseJSON.message);
            }
        });
    });

    // View salary history handler
    $(document).on('click', '.view-history', function() {
        let employeeId = $(this).data('id');
        loadSalaryHistory(employeeId);
    });

    // Revise salary button handler
    $(document).on('click', '.revise-salary', function() {
        let employeeId = $(this).data('id');
        loadEmployeeDetails(employeeId);
    });

    // Calculate percentage increase
    $('#new_salary').on('input', function() {
        calculateAndDisplayIncrease();
    });

    // Filter handlers
    $('#department_filter').on('change', function() {
        salaryTable.column(2).search($(this).val()).draw();
    });

    $('#salary_range_filter').on('change', function() {
        filterBySalaryRange($(this).val());
    });

    // Helper Functions
    function loadSalaryHistory(employeeId) {
        $.ajax({
            url: `/api/employee-salaries/${employeeId}/history`,
            method: 'GET',
            success: function(response) {
                renderSalaryHistory(response);
                $('#salary_history_modal').modal('show');
            },
            error: function(xhr) {
                showErrorAlert('Error loading salary history');
            }
        });
    }

    function loadEmployeeDetails(employeeId) {
        $.ajax({
            url: `/api/employee-salaries/${employeeId}`,
            method: 'GET',
            success: function(response) {
                populateRevisionModal(response);
                $('#salary_revision_modal').modal('show');
            },
            error: function(xhr) {
                showErrorAlert('Error loading employee details');
            }
        });
    }

    function renderSalaryHistory(history) {
        let historyTable = $('#salary_history_table').DataTable();
        historyTable.clear();
        
        history.forEach(record => {
            historyTable.row.add([
                moment(record.effective_date).format('DD MMM YYYY'),
                formatCurrency(record.previous_salary),
                formatCurrency(record.new_salary),
                calculatePercentageChange(record.previous_salary, record.new_salary) + '%',
                record.revision_reason,
                record.approved_by
            ]);
        });
        
        historyTable.draw();
    }

    function populateRevisionModal(employee) {
        $('#employee_id').val(employee.id);
        $('#employee_name_display').text(employee.name);
        $('#current_salary').val(employee.current_salary);
        $('#effective_date').val(moment().format('YYYY-MM-DD'));
        $('#new_salary').val('');
        $('#revision_reason').val('');
        $('#revision_notes').val('');
    }

    function calculateAndDisplayIncrease() {
        let currentSalary = parseFloat($('#current_salary').val());
        let newSalary = parseFloat($('#new_salary').val());
        
        if (currentSalary && newSalary) {
            let percentageChange = calculatePercentageChange(currentSalary, newSalary);
            $('#percentage_increase').text(percentageChange + '%');
        } else {
            $('#percentage_increase').text('--');
        }
    }

    function calculatePercentageChange(oldValue, newValue) {
        return ((newValue - oldValue) / oldValue * 100).toFixed(2);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function filterBySalaryRange(range) {
        let ranges = {
            'low': [0, 50000],
            'medium': [50001, 100000],
            'high': [100001, Infinity]
        };
        
        $.fn.dataTable.ext.search.push(function(settings, data) {
            if (range === 'all') return true;
            
            let salary = parseFloat(data[4].replace(/[^0-9.-]+/g, ''));
            let [min, max] = ranges[range];
            return salary >= min && salary <= max;
        });
        
        salaryTable.draw();
        $.fn.dataTable.ext.search.pop();
    }

    function showSuccessAlert(message) {
        toastr.success(message);
    }

    function showErrorAlert(message) {
        toastr.error(message);
    }

    // Export functionality
    $('#export_salary_data').on('click', function() {
        let exportFormat = $('#export_format').val();
        exportSalaryData(exportFormat);
    });

    function exportSalaryData(format) {
        $.ajax({
            url: '/api/employee-salaries/export',
            method: 'GET',
            data: { format: format },
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
                a.download = `employee_salaries.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting salary data');
            }
        });
    }
}); 