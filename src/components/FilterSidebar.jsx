import React from 'react'
import { 
  Box, Text, Checkbox, Stack, 
  RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  HStack
} from '@chakra-ui/react'

function FilterSidebar({ categorySlug, filters, setFilters, minMaxPrice, options }) {

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const currentValues = prev[key] || []
      if (currentValues.includes(value)) {
        return { ...prev, [key]: currentValues.filter(v => v !== value) }
      } else {
        return { ...prev, [key]: [...currentValues, value] }
      }
    })
  }

  const handlePriceChange = (val) => {
    setFilters(prev => ({ ...prev, priceRange: val }))
  }

  const handleSaleChange = (e) => {
    setFilters(prev => ({ ...prev, onlySale: e.target.checked }))
  }

  const renderCheckboxGroup = (title, key, optionsList) => {
    if (!optionsList || optionsList.length === 0) return null
    return (
      <AccordionItem border="none" mb={4}>
        <h2>
          <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
            <Box flex='1' textAlign='left' fontWeight="bold" textTransform="uppercase" fontSize="sm">
              {title}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4} px={0}>
          <Stack spacing={2} maxH={key === 'flavor' ? "200px" : "auto"} overflowY={key === 'flavor' ? "auto" : "visible"}>
            {optionsList.map(opt => (
              <Checkbox 
                key={opt} 
                colorScheme="blackAlpha" 
                iconColor="white"
                borderColor="black"
                isChecked={filters[key]?.includes(opt)}
                onChange={() => handleFilterChange(key, opt)}
              >
                <Text fontSize="sm">{opt}</Text>
              </Checkbox>
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    )
  }

  return (
    <Box w={{ base: "100%", md: "250px" }} pr={{ md: 6 }} borderRight={{ md: "1px solid black" }}>
      
      <Accordion allowMultiple defaultIndex={[0, 1, 2, 3]}>
        
        {/* ЦІНА */}
        <AccordionItem border="none" mb={6}>
          <Text fontWeight="bold" mb={4} textTransform="uppercase" fontSize="sm">Ціна</Text>
          <RangeSlider 
            aria-label={['min', 'max']} 
            min={minMaxPrice[0]} max={minMaxPrice[1]} 
            defaultValue={[minMaxPrice[0], minMaxPrice[1]]}
            onChangeEnd={handlePriceChange}
            colorScheme="pink"
          >
            <RangeSliderTrack bg='gray.200'>
              <RangeSliderFilledTrack bg='black' />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} border="2px solid black" boxSize={4} />
            <RangeSliderThumb index={1} border="2px solid black" boxSize={4} />
          </RangeSlider>
          <HStack justify="space-between" mt={2}>
            <Text fontSize="xs" fontWeight="bold">{filters.priceRange?.[0] || minMaxPrice[0]} ₴</Text>
            <Text fontSize="xs" fontWeight="bold">{filters.priceRange?.[1] || minMaxPrice[1]} ₴</Text>
          </HStack>
        </AccordionItem>

        {/* АКЦІЇ */}
        <Box mb={6}>
          <Checkbox 
            colorScheme="blackAlpha" 
            borderColor="black"
            isChecked={filters.onlySale} 
            onChange={handleSaleChange} 
            fontWeight="bold"
          >
            Тільки зі знижкою %
          </Checkbox>
        </Box>

        {/* БРЕНД */}
        {renderCheckboxGroup("Бренд", "brand", options.brands)}

        {/* === РІДИНИ === */}
        {categorySlug === 'liquids' && (
          <>
            {renderCheckboxGroup("Об'єм (мл)", "volume", options.volumes)} {/* 👈 ДОДАНО */}
            {renderCheckboxGroup("Група смаків", "tasteGroup", options.tasteGroups)}
            {renderCheckboxGroup("Конкретний смак", "flavor", options.flavors)}
            {renderCheckboxGroup("Країна", "country", options.countries)}
          </>
        )}

        {/* === POD СИСТЕМИ === */}
        {categorySlug === 'pods' && (
          <>
            {renderCheckboxGroup("Дисплей", "display", options.displays)}
            {renderCheckboxGroup("Матеріал", "material", options.materials)}
            {renderCheckboxGroup("Регулювання потужності", "powerMode", options.powerModes)}
            {renderCheckboxGroup("Тип керування", "controlType", options.controlTypes)}
          </>
        )}

        {/* === КОМПЛЕКТУЮЧІ === */}
        {categorySlug === 'parts' && (
          <>
             {renderCheckboxGroup("Опір (Ом)", "resistance", options.resistances)}
             {renderCheckboxGroup("Об'єм (мл)", "volume", options.volumes)}
          </>
        )}

      </Accordion>
    </Box>
  )
}

export default FilterSidebar