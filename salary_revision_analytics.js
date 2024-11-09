$(document).ready(function() {
    // Initialize charts and analytics when page loads
    loadSalaryAnalytics();
    
    // Refresh button handler
    $('#refresh_analytics').on('click', function() {
        loadSalaryAnalytics();
    });

    // Date range filter handler
    $('#date_range_filter').on('change', function() {
        loadSalaryAnalytics($(this).val());
    });

    function loadSalaryAnalytics(dateRange = 'year') {
        $.ajax({
            url: '/api/salary-revisions/analytics',
            method: 'GET',
            data: { dateRange: dateRange },
            success: function(data) {
                renderAnalytics(data);
            },
            error: function(xhr) {
                showErrorAlert('Error loading salary analytics');
            }
        });
    }

    function renderAnalytics(data) {
        renderSalaryTrends(data.salaryTrends);
        renderIncreaseDistribution(data.increaseDistribution);
        renderDepartmentComparison(data.departmentStats);
        updateSummaryMetrics(data.summaryMetrics);
    }

    function renderSalaryTrends(trendData) {
        const ctx = document.getElementById('salary_trends_chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.dates,
                datasets: [{
                    label: 'Average Salary',
                    data: trendData.averageSalaries,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Salary Trends Over Time'
                    }
                }
            }
        });
    }

    function renderIncreaseDistribution(distributionData) {
        const ctx = document.getElementById('increase_distribution_chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: distributionData.ranges,
                datasets: [{
                    label: 'Number of Revisions',
                    data: distributionData.counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution of Salary Increases'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Percentage Increase Range'
                        }
                    }
                }
            }
        });
    }

    function renderDepartmentComparison(departmentData) {
        const ctx = document.getElementById('department_comparison_chart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: departmentData.departments,
                datasets: [{
                    label: 'Average Increase %',
                    data: departmentData.averageIncreases,
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    pointBackgroundColor: 'rgb(255, 99, 132)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 99, 132)'
                }]
            },
            options: {
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Department-wise Salary Increases'
                    }
                }
            }
        });
    }

    function updateSummaryMetrics(metrics) {
        $('#average_increase').text(metrics.averageIncrease.toFixed(2) + '%');
        $('#total_revisions').text(metrics.totalRevisions);
        $('#highest_increase').text(metrics.highestIncrease.toFixed(2) + '%');
        $('#average_salary').text(formatCurrency(metrics.averageSalary));
    }

    // Utility functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function showErrorAlert(message) {
        toastr.error(message);
    }

    // Export functionality
    $('#export_analytics').on('click', function() {
        exportAnalyticsReport();
    });

    function exportAnalyticsReport() {
        $.ajax({
            url: '/api/salary-revisions/analytics/export',
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response) {
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'salary_analytics_report.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function(xhr) {
                showErrorAlert('Error exporting analytics report');
            }
        });
    }

    // Custom date range picker initialization
    $('#custom_date_range').daterangepicker({
        ranges: {
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Quarter': [moment().subtract(3, 'month').startOf('month'), moment().endOf('month')],
            'This Year': [moment().startOf('year'), moment().endOf('year')]
        },
        startDate: moment().subtract(29, 'days'),
        endDate: moment()
    }, function(start, end) {
        loadSalaryAnalytics('custom', start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    });
}); 