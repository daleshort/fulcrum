from django.db import models

# Create your models here.

# A project


class Project(models.Model):
    title = models.CharField(max_length=100)

# tag associated with a project


class ProjectTag(models.Model):
    tag_text = models.CharField(max_length=100)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='tags')

# A measure associated with a project


class Measure(models.Model):
    title = models.CharField(max_length=100)
    units = models.CharField(max_length=100, null=True)
    type = models.CharField(max_length=100)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="measure")

# A parameter associated with a Measure


class Parameter(models.Model):
    parameter = models.FloatField(null=True)
    parameter_title = models.CharField(max_length=32, null=True)
    measure = models.ForeignKey(
        Measure, on_delete=models.CASCADE, null=True, related_name="parameters")

# a result on a given date


class Results(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    measure = models.ForeignKey(Measure, on_delete=models.CASCADE)
    measure_result = models.FloatField()
    date = models.DateField(null=True)

# a tag associated with a measure


class MeasureTag(models.Model):
    tag_text = models.CharField(max_length=100)
    measure = models.ForeignKey(Measure, on_delete=models.CASCADE, null=True)
