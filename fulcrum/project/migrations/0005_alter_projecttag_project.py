# Generated by Django 4.0.6 on 2022-07-21 17:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0004_measure_alter_projecttag_project_results_parameter_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projecttag',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to='project.project'),
        ),
    ]