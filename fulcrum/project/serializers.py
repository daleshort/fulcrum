from pyexpat import model
from wsgiref.validate import validator
from rest_framework import serializers
from .models import Measure, MeasureTag, MeasureVisual, Parameter, Project, ProjectTag, Visual

# https://ilovedjango.com/django/rest-api-framework/tips/save-foreign-key-using-django-rest-framework-create-method/

# serializer for all tags in all projects


class ProjectTagListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTag
        fields = ['id', 'tag_text', 'project_id']

    def create(self, validated_data):

        print(validated_data)
        return ProjectTag.objects.create(project_id=self.context['project_id'], ** validated_data)

# serializer for a specific projects tags


class ProjectTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTag
        fields = ['id', 'tag_text', 'project_id']

    def create(self, validated_data):
        project_id = self.context['project_id']
        return ProjectTag.objects.create(project_id=project_id, **validated_data)


class MeasureTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasureTag
        fields = ['id', 'tag_text', 'measure_id']


class ParameterSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        measure_id = self.context['measure_id']
        return Parameter.objects.create(measure_id=measure_id, **validated_data)

    class Meta:
        model = Parameter
        fields = ['id', 'parameter_float', 'parameter_date',
                  'parameter_char', 'parameter_title', 'measure_id']


class MeasureVisualSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasureVisual
        fields = ['project', 'measure', 'visual',
                  'start_date', 'end_date', 'collect', 'style_color']


class VisualSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        measurevisual_data = validated_data.pop('measurevisuals')
        visual = Visual.objects.create(**validated_data)

        for measurevisual in measurevisual_data:
            MeasureVisual.objects.create(**measurevisual)
        return visual

    def update(self, instance, validated_data):

        if self.context['request_data'].get("measurevisuals"):
            measurevisual_data = self.context['request_data'].pop(
                'measurevisuals')

            measurevisual_dict = dict((i.id, i)
                                      for i in instance.measurevisuals.all())

            for item_data in measurevisual_data:
                if 'id' in item_data:
                    # if exists id remove from the dict and update
                    measurevisual_item = measurevisual_dict.pop(
                        item_data['id'])
                    # remove id from validated data as we don't require it.
                    item_data.pop('id')
                    # loop through the rest of keys in validated data to assign it to its respective field
                    for key in item_data.keys():
                        setattr(measurevisual_item, key, item_data[key])

                    measurevisual_item.save()
                else:
                    # else create a new object
                    MeasureVisual.objects.create(visual=instance, **item_data)

        # delete remaining elements because they're not present in my update call
            if len(measurevisual_dict) > 0:
                for item in measurevisual_dict.values():
                    item.delete()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    measurevisuals = MeasureVisualSerializer(many=True, read_only=False)

    class Meta:
        model = Visual
        fields = ['title', 'type', 'measurevisuals']


class MeasureSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        parameter_data = validated_data.pop('parameters')
        project_id = self.context['project_id']

        measure = Measure.objects.create(
            project_id=project_id, **validated_data)

        for parameter in parameter_data:
            Parameter.objects.create(measure=measure, **parameter)
        return measure

    def update(self, instance, validated_data):

        if self.context['request_data'].get('parameters'):
            parameter_data = self.context['request_data'].pop('parameters')
            validated_parameter_data = validated_data.pop('parameters')
            # note that we're using raw data from the request data and not the validated data
            # when we go to update the nested object because we need the ID field which is stripped
            # from validated data

            parameter_dict = dict((i.id, i) for i in instance.parameters.all())

            for item_data in parameter_data:
                if 'id' in item_data:
                    # if exists id remove from the dict and update
                    parameter_item = parameter_dict.pop(item_data['id'])
                    # remove id from validated data as we don't require it.
                    item_data.pop('id')
                    # loop through the rest of keys in validated data to assign it to its respective field
                    for key in item_data.keys():
                        setattr(parameter_item, key, item_data[key])

                    parameter_item.save()
                else:
                    # else create a new object
                    Parameter.objects.create(measure=instance, **item_data)

        # delete remaining elements because they're not present in my update call
            if len(parameter_dict) > 0:
                for item in parameter_dict.values():
                    item.delete()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

    parameters = ParameterSerializer(many=True, read_only=False)

    class Meta:
        model = Measure
        fields = ['id', 'title', 'units', 'type', 'project_id', 'parameters']
       # extra_kwargs = {'id': {'read_only': False, 'required': True}}


# project serializer


class ProjectSerializer(serializers.ModelSerializer):
    tags = ProjectTagSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'tags']
