{{/*
Return the name of the chart
*/}}
{{- define "redis-chart.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{/*
Return the full name of the release
*/}}
{{- define "redis-chart.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

