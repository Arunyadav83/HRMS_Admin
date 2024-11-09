$(document).ready(function() {
    // Initialize datatable
    let salaryHistoryTable = $('#salary_history_table').DataTable({
        ordering: true,
        searching: true,
        paging: true,
        pageLength: 10,
        columns: [
            { data: 'effective_date' },
            { data: 'previous_salary' },
            { data: 'new_salary' },
            { data: 'percentage_increase' },
            { data: 'reason' },
            { data: 'approved_by' },
            { data: 'actions' }
        ],
        columnDefs: [
            {
                targets: 0, // effective_date column
                render: function(data) {
                    return moment(data).format('DD MMM YYYY');
                }
            },
            {
                targets: [1, 2], // salary columns
                render: function(data) {
                    return formatCurrency(data);
                }
            },
            {
                targets: 3, // percentage column
                render: function(data) {
                    return data + '%';
                }
            },
            {
                targets: -1, // actions column
                orderable: false,
                render: function(data, type, row) {
                    return `
                        <div class="dropdown dropdown-action">
                            <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="material-icons">more_vert</i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" href="#" onclick="viewRevision(${row.id})">
                                    <i class="fa fa-eye m-r-5"></i> View
                                </a>
                                <a class="dropdown-item" href="#" onclick="editRevision(${row.id})">
                                    <i class="fa fa-pencil m-r-5"></i> Edit
                                </a>
                                <a class="dropdown-item" href="#" onclick="deleteRevision(${row.id})">
                                    <i class="fa fa-trash-o m-r-5"></i> Delete
                                </a>
                            </div>
                        </div>`;
                }
            }
        ]
    });

    // Add new salary revision
    $('#add_salary_revision').on('submit', function(e) {
        e.preventDefault();
        
        let formData = {
            effective_date: $('#effective_date').val(),
            previous_salary: parseFloat($('#previous_salary').val()),
            new_salary: parseFloat($('#new_salary').val()),
            percentage_increase: calculatePercentageIncrease(),
            reason: $('#revision_reason').val(),
            approved_by: $('#approved_by').val()
        };

        // Ajax call to save data
        $.ajax({
            url: '/api/salary-revisions',
            method: 'POST',
            data: formData,
            success: function(response) {
                $('#add_revision_modal').modal('hide');
                salaryHistoryTable.ajax.reload();
                showSuccessAlert('Salary revision added successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error adding salary revision');
            }
        });
    });

    // Helper functions
    function calculatePercentageIncrease() {
        let previousSalary = parseFloat($('#previous_salary').val());
        let newSalary = parseFloat($('#new_salary').val());
        return ((newSalary - previousSalary) / previousSalary * 100).toFixed(2);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    function showSuccessAlert(message) {
        toastr.success(message);
    }

    function showErrorAlert(message) {
        toastr.error(message);
    }
});

// View salary revision details
function viewRevision(id) {
    $.ajax({
        url: `/api/salary-revisions/${id}`,
        method: 'GET',
        success: function(response) {
            $('#view_effective_date').text(moment(response.effective_date).format('DD MMM YYYY'));
            $('#view_previous_salary').text(formatCurrency(response.previous_salary));
            $('#view_new_salary').text(formatCurrency(response.new_salary));
            $('#view_percentage').text(response.percentage_increase + '%');
            $('#view_reason').text(response.reason);
            $('#view_approved_by').text(response.approved_by);
            $('#view_revision_modal').modal('show');
        },
        error: function(xhr) {
            showErrorAlert('Error fetching revision details');
        }
    });
}

// Edit salary revision
function editRevision(id) {
    $.ajax({
        url: `/api/salary-revisions/${id}`,
        method: 'GET',
        success: function(response) {
            $('#edit_id').val(response.id);
            $('#edit_effective_date').val(moment(response.effective_date).format('YYYY-MM-DD'));
            $('#edit_previous_salary').val(response.previous_salary);
            $('#edit_new_salary').val(response.new_salary);
            $('#edit_reason').val(response.reason);
            $('#edit_approved_by').val(response.approved_by);
            $('#edit_revision_modal').modal('show');
        },
        error: function(xhr) {
            showErrorAlert('Error fetching revision details');
        }
    });
}

// Delete salary revision
function deleteRevision(id) {
    if (confirm('Are you sure you want to delete this salary revision?')) {
        $.ajax({
            url: `/api/salary-revisions/${id}`,
            method: 'DELETE',
            success: function(response) {
                $('#salary_history_table').DataTable().ajax.reload();
                showSuccessAlert('Salary revision deleted successfully');
            },
            error: function(xhr) {
                showErrorAlert('Error deleting salary revision');
            }
        });
    }
}

// Update salary revision
$('#edit_salary_revision').on('submit', function(e) {
    e.preventDefault();
    
    let id = $('#edit_id').val();
    let formData = {
        effective_date: $('#edit_effective_date').val(),
        previous_salary: parseFloat($('#edit_previous_salary').val()),
        new_salary: parseFloat($('#edit_new_salary').val()),
        percentage_increase: calculatePercentageIncrease(),
        reason: $('#edit_reason').val(),
        approved_by: $('#edit_approved_by').val()
    };

    $.ajax({
        url: `/api/salary-revisions/${id}`,
        method: 'PUT',
        data: formData,
        success: function(response) {
            $('#edit_revision_modal').modal('hide');
            $('#salary_history_table').DataTable().ajax.reload();
            showSuccessAlert('Salary revision updated successfully');
        },
        error: function(xhr) {
            showErrorAlert('Error updating salary revision');
        }
    });
}); 